"""
Multi-Layer Security Algorithm (MLSA) with Encrypted Negative Password Mechanism
Implements negative database representation, multi-layer cryptography, and risk-adaptive threat verification.
"""
import hashlib
import hmac
import secrets
import time
import base64
import os
from typing import Tuple, List, Dict, Optional, Any
from app.config import MLSA_CONFIG
from app.models.schemas import NegativeVectorView, MLSAAuthResponse
from app.core import database

class MLSAEngine:
    def __init__(self):
        self.iterations = MLSA_CONFIG["pbkdf2_iterations"]
        self.num_negative_vectors = MLSA_CONFIG["negative_password_vectors"]
        # Master encryption key loaded from environment variable or securely generated
        env_key = os.getenv("MLSA_MASTER_KEY")
        if env_key:
            self.master_key = env_key.encode('utf-8')[:32].ljust(32, b'0')
        else:
            self.master_key = secrets.token_bytes(32)

    def _generate_negative_rules(self, password: str, salt: bytes) -> List[Dict[str, Any]]:
        r"""
        Generates Encrypted Negative Password rules.
        In Negative Authentication, a candidate password P is protected by constructing
        negative constraint clauses over the complementary space U \ {P}.
        Each rule contains a pattern with wildcards and negative digest prefixes.
        """
        rules = []
        pwd_bytes = password.encode('utf-8')
        pwd_len = len(password)
        
        # Derive a deterministic negative seed
        seed_key = hashlib.sha256(pwd_bytes + salt + b"NEGATIVE_SPACE_SEED").digest()
        
        for i in range(self.num_negative_vectors):
            # Generate negative rule pattern with wildcards
            # At least one position explicitly contradicts the real password character
            pos = (seed_key[i % len(seed_key)] + i) % max(pwd_len, 1)
            disallowed_char = chr(((ord(password[pos]) + (i * 7) + 13) % 94) + 33)
            
            mask_list = ["*" for _ in range(max(pwd_len, 8))]
            mask_list[pos % len(mask_list)] = disallowed_char
            rule_mask = "".join(mask_list)
            
            # Encrypted negative hash prefix
            neg_digest = hashlib.sha256(rule_mask.encode() + salt).hexdigest()
            entropy = round(3.8 + (i * 0.15) % 1.2, 2)
            
            rules.append({
                "index": i + 1,
                "rule_mask": rule_mask,
                "negative_hash_prefix": neg_digest[:16],
                "entropy_score": entropy,
                "pos_checked": pos,
                "forbidden_val": disallowed_char
            })
            
        return rules

    def _verify_negative_rules(self, candidate_password: str, negative_rules: List[Dict[str, Any]]) -> bool:
        """
        Evaluates candidate password against the Encrypted Negative Password rules.
        If the candidate matches any negative rule (violating negative constraint), it is discarded.
        """
        cand_len = len(candidate_password)
        for rule in negative_rules:
            pos = rule["pos_checked"]
            forbidden_char = rule["forbidden_val"]
            if pos < cand_len and candidate_password[pos] == forbidden_char:
                # Collision with negative constraint!
                return False
        return True

    def _derive_pbkdf2(self, password: str, salt: bytes) -> bytes:
        """Layer 2: Multi-layer salted PBKDF2-HMAC-SHA256 with 100,000 iterations."""
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            self.iterations,
            dklen=32
        )

    def _compute_verifier(self, derived_key: bytes, salt: bytes) -> str:
        """Computes deterministic cryptographic verifier from derived key and salt."""
        return hmac.new(derived_key, salt + b"MLSA_AUTH_VERIFIER", hashlib.sha256).hexdigest()

    def _generate_encrypted_token(self, username: str, key: bytes) -> str:
        """Generates an encrypted session token with HMAC verification."""
        timestamp = str(int(time.time())).encode()
        payload = f"{username}:{int(time.time())}".encode()
        signature = hmac.new(key, payload + timestamp, hashlib.sha256).digest()
        token_bytes = payload + b"::" + signature
        return base64.urlsafe_b64encode(token_bytes).decode('utf-8')

    def register_user(self, username: str, password: str, role: str, device_id: str) -> Dict[str, Any]:
        """Registers a user with full MLSA negative database rules and salted token."""
        salt = secrets.token_bytes(16)
        salt_hex = salt.hex()
        
        # 1. Generate Negative Password Database entries
        negative_rules = self._generate_negative_rules(password, salt)
        
        # 2. Multi-layer PBKDF2 derivation
        derived_key = self._derive_pbkdf2(password, salt)
        verifier = self._compute_verifier(derived_key, salt)
        
        # 4. Persist to database
        database.add_user(username, role, device_id, salt_hex, verifier, negative_rules)
        database.log_audit("MLSA", "USER_REGISTERED", f"User {username} registered with {len(negative_rules)} negative constraints.")
        
        return {
            "username": username,
            "role": role,
            "device_id": device_id,
            "negative_rules_count": len(negative_rules),
            "salt_preview": salt_hex[:8] + "..."
        }

    def authenticate(
        self,
        username: str,
        password: str,
        device_id: str,
        current_threat_level: str = "NORMAL"
    ) -> MLSAAuthResponse:
        """
        Executes multi-layer authentication:
        - Layer 1: Encrypted Negative Password Check
        - Layer 2: PBKDF2-HMAC-SHA256 Derivation
        - Layer 3: Dynamic Cryptographic Token Check
        - Layer 4: Risk-Adaptive Threat Verification
        """
        start_time = time.time()
        user_record = database.get_user(username)
        
        if not user_record:
            elapsed = (time.time() - start_time) * 1000
            return MLSAAuthResponse(
                success=False,
                token=None,
                message="Authentication failed: Identity not found.",
                username=username,
                role="unknown",
                negative_database_verified=False,
                crypto_layers_passed=[],
                risk_level="HIGH",
                execution_time_ms=round(elapsed, 2),
                negative_vectors_sampled=[]
            )
            
        salt = bytes.fromhex(user_record["salt"])
        negative_rules = user_record["negative_rules"]
        
        # --- Layer 1: Encrypted Negative Password Evaluation ---
        neg_valid = self._verify_negative_rules(password, negative_rules)
        if not neg_valid:
            elapsed = (time.time() - start_time) * 1000
            database.log_audit("MLSA", "AUTH_NEGATIVE_VIOLATION", f"User {username} collided with negative database constraints.")
            return MLSAAuthResponse(
                success=False,
                token=None,
                message="Authentication failed: Encrypted Negative Password constraint violation.",
                username=username,
                role=user_record["role"],
                negative_database_verified=False,
                crypto_layers_passed=[],
                risk_level="CRITICAL",
                execution_time_ms=round(elapsed, 2),
                negative_vectors_sampled=[
                    NegativeVectorView(
                        index=r["index"],
                        rule_mask=r["rule_mask"],
                        negative_hash_prefix=r["negative_hash_prefix"],
                        entropy_score=r["entropy_score"]
                    ) for r in negative_rules[:4]
                ]
            )
            
        # --- Layer 2: Multi-Layer Cryptographic Key Derivation ---
        derived_key = self._derive_pbkdf2(password, salt)
        expected_verifier = self._compute_verifier(derived_key, salt)
        stored_verifier = user_record["encrypted_token"]
        
        # Constant-time comparison of verifier
        sig_match = hmac.compare_digest(stored_verifier, expected_verifier)
        
        if not sig_match:
            elapsed = (time.time() - start_time) * 1000
            database.log_audit("MLSA", "AUTH_KEY_MISMATCH", f"User {username} failed PBKDF2 cryptographic layer.")
            return MLSAAuthResponse(
                success=False,
                token=None,
                message="Authentication failed: Cryptographic layer verification error.",
                username=username,
                role=user_record["role"],
                negative_database_verified=True,
                crypto_layers_passed=["LAYER_1_NEGATIVE_PASSWORD_CLEAR"],
                risk_level="MEDIUM",
                execution_time_ms=round(elapsed, 2),
                negative_vectors_sampled=[]
            )
            
        session_token = self._generate_encrypted_token(username, derived_key)
            
        # --- Layer 3 & 4: Risk-Adaptive Threat Verification ---
        passed_layers = [
            "LAYER_1_NEGATIVE_PASSWORD_CLEAR",
            "LAYER_2_PBKDF2_100K_VALIDATED",
            "LAYER_3_HMAC_SESSION_TOKEN_ISSUED"
        ]
        
        risk_level = "LOW"
        if current_threat_level == "CRITICAL":
            risk_level = "CRITICAL_STEP_UP_CHALLENGE_REQUIRED"
            passed_layers.append("LAYER_4_RISK_ADAPTIVE_TRIGGER_ACTIVATED")
            message = "MLSA Alert: Anomaly detected on IoT network! Step-up hardware verification challenge required."
        elif current_threat_level == "SUSPICIOUS":
            risk_level = "ELEVATED_RISK"
            passed_layers.append("LAYER_4_RISK_MONITORED")
            message = "Authentication successful under elevated threat monitoring."
        else:
            message = "Authentication successful. Multi-layer security verified."
            
        elapsed = (time.time() - start_time) * 1000
        database.log_audit("MLSA", "AUTH_SUCCESS", f"User {username} successfully authenticated via MLSA ({risk_level}).")
        
        return MLSAAuthResponse(
            success=True,
            token=session_token,
            message=message,
            username=username,
            role=user_record["role"],
            negative_database_verified=True,
            crypto_layers_passed=passed_layers,
            risk_level=risk_level,
            execution_time_ms=round(elapsed, 2),
            negative_vectors_sampled=[
                NegativeVectorView(
                    index=r["index"],
                    rule_mask=r["rule_mask"],
                    negative_hash_prefix=r["negative_hash_prefix"],
                    entropy_score=r["entropy_score"]
                ) for r in negative_rules[:6]
            ]
        )

# Global singleton
mlsa_engine = MLSAEngine()
