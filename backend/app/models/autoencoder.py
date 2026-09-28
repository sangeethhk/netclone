"""
PyTorch Autoencoder Architecture for IoT Network Traffic Anomaly Detection
Learns low-dimensional latent representations of normal IoT traffic and detects anomalies
via high reconstruction error (MSE).
"""
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Tuple, List, Optional
import os

class TrafficAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 10, latent_dim: int = 4):
        super(TrafficAutoencoder, self).__init__()
        
        # Encoder Network: Compresses 10-D flow features to 4-D latent bottleneck
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 8),
            nn.BatchNorm1d(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, latent_dim),
            nn.LeakyReLU(0.2)
        )
        
        # Decoder Network: Reconstructs original 10-D features from latent space
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 8),
            nn.BatchNorm1d(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, input_dim)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction

class AutoencoderDetector:
    def __init__(self, input_dim: int = 10, threshold: float = 0.045):
        self.input_dim = input_dim
        self.threshold = threshold
        self.model = TrafficAutoencoder(input_dim=input_dim)
        self.device = torch.device("cpu")  # Lightweight CPU inference for IoT cyber twin
        self.model.to(self.device)
        self.criterion = nn.MSELoss(reduction='none')
        self.is_trained = False
        self.mean = np.zeros(input_dim)
        self.std = np.ones(input_dim)

    def train_baseline(self, normal_samples: np.ndarray, epochs: int = 35, lr: float = 0.005) -> float:
        """
        Trains the Autoencoder on baseline normal IoT traffic vectors.
        """
        # Calculate feature normalization statistics
        self.mean = np.mean(normal_samples, axis=0)
        self.std = np.std(normal_samples, axis=0)
        self.std[self.std == 0] = 1.0  # Prevent divide-by-zero
        
        normalized_data = (normal_samples - self.mean) / self.std
        tensor_data = torch.tensor(normalized_data, dtype=torch.float32).to(self.device)
        
        optimizer = optim.Adam(self.model.parameters(), lr=lr, weight_decay=1e-5)
        loss_func = nn.MSELoss()
        
        self.model.train()
        dataset = torch.utils.data.TensorDataset(tensor_data)
        loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)
        
        final_loss = 0.0
        for epoch in range(epochs):
            total_loss = 0.0
            for batch in loader:
                inputs = batch[0]
                optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = loss_func(outputs, inputs)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            final_loss = total_loss / len(loader)
            
        self.model.eval()
        self.is_trained = True
        
        # Calibrate adaptive threshold based on 98th percentile of reconstruction loss on normal data
        with torch.no_grad():
            recons = self.model(tensor_data)
            sample_losses = torch.mean((recons - tensor_data) ** 2, dim=1).cpu().numpy()
            self.threshold = float(np.percentile(sample_losses, 98))
            # Keep a sensible floor
            self.threshold = max(self.threshold, 0.035)
            
        return final_loss

    def score_sample(self, feature_vector: List[float]) -> Tuple[float, bool]:
        """
        Computes reconstruction error (MSE) for a single network flow vector.
        Returns: (mse_loss, is_anomaly)
        """
        self.model.eval()
        feat_arr = np.array(feature_vector, dtype=np.float32)
        norm_feat = (feat_arr - self.mean) / self.std
        tensor_input = torch.tensor(norm_feat.reshape(1, -1), dtype=torch.float32).to(self.device)
        
        with torch.no_grad():
            reconstruction = self.model(tensor_input)
            loss_tensor = torch.mean((reconstruction - tensor_input) ** 2)
            mse = float(loss_tensor.item())
            
        is_anomaly = mse > self.threshold
        return mse, is_anomaly

    def save_weights(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save({
            "model_state": self.model.state_dict(),
            "threshold": self.threshold,
            "mean": self.mean,
            "std": self.std,
            "is_trained": self.is_trained,
        }, path)

    def load_weights(self, path: str) -> bool:
        if not os.path.exists(path):
            return False
        checkpoint = torch.load(path, map_location=self.device, weights_only=False)
        self.model.load_state_dict(checkpoint["model_state"])
        self.threshold = checkpoint.get("threshold", 0.045)
        self.mean = checkpoint.get("mean", self.mean)
        self.std = checkpoint.get("std", self.std)
        self.is_trained = checkpoint.get("is_trained", True)
        self.model.eval()
        return True
