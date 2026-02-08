"""
WebSocket Manager for ShapeX Studio
Handles real-time streaming of agent progress
"""
from fastapi import WebSocket
from typing import Dict
import logging
import json

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections for Studio sessions.
    Handles connection lifecycle and message streaming.
    """

    def __init__(self):
        """Initialize WebSocket manager"""
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        """
        Connect and accept WebSocket.

        Args:
            session_id: Session identifier
            websocket: WebSocket connection
        """
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected for session {session_id}")

    def disconnect(self, session_id: str):
        """
        Disconnect WebSocket.

        Args:
            session_id: Session identifier
        """
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected for session {session_id}")

    async def send_message(self, session_id: str, message: dict):
        """
        Send message to specific session.

        Args:
            session_id: Session identifier
            message: Message dictionary to send

        Returns:
            True if sent successfully, False otherwise
        """
        if session_id in self.active_connections:
            ws = self.active_connections[session_id]
            try:
                await ws.send_json(message)
                return True
            except Exception as e:
                logger.error(f"Failed to send message to {session_id}: {e}")
                self.disconnect(session_id)
                return False
        return False

    async def send_text(self, session_id: str, text: str):
        """
        Send text message to specific session.

        Args:
            session_id: Session identifier
            text: Text to send

        Returns:
            True if sent successfully, False otherwise
        """
        if session_id in self.active_connections:
            ws = self.active_connections[session_id]
            try:
                await ws.send_text(text)
                return True
            except Exception as e:
                logger.error(f"Failed to send text to {session_id}: {e}")
                self.disconnect(session_id)
                return False
        return False

    def is_connected(self, session_id: str) -> bool:
        """
        Check if session has active WebSocket connection.

        Args:
            session_id: Session identifier

        Returns:
            True if connected, False otherwise
        """
        return session_id in self.active_connections

    def get_connection_count(self) -> int:
        """
        Get number of active connections.

        Returns:
            Number of active WebSocket connections
        """
        return len(self.active_connections)


# Global WebSocket manager instance
ws_manager = WebSocketManager()
