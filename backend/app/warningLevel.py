"""Warning level calculation module for SafeToManu.

This module determines the overall swimming safety warning level
based on multiple environmental factors.
"""

from . import regionalCouncilApi as regional


def calculate_warning_level():
    """Return the overall warning level based on water quality, tide height, 
    water temperature, and other metrics.
    
    Warning Levels:
        1 = Good - Safe to swim
        2 = Moderate - Swim with discretion
        3 = Bad - Swimming not advised
    
    Returns:
        dict: {
            "level": int,
            "message": str,
            "tide_height": float,
            "water_temp": float
        }
    """
    # Fetch all metrics
    water_quality = regional.get_enterococci()
    tide_height = regional.get_tide_height()
    water_temp = regional.get_water_temprature()
    
    # Calculate warning level based on water quality thresholds
    if water_quality is None:
        level = 1
        message = "Waves clean • Sun shining • Conditions green"
    elif water_quality <= 140:
        level = 1
        message = "Waves clean • Sun shining • Conditions green"
    elif water_quality <= 280:
        level = 2
        message = "Elevated levels detected • Use caution • Check signage"
    else:
        level = 3
        message = "High contaminants detected • Swimming not advised"
    
    # Adjust warning level based on tide height (very low tide can expose hazards)
    if tide_height is not None and tide_height < 4 and level < 2:
        level = 2
        message = "Low tide conditions • Watch for exposed rocks • Swim with caution"
    elif tide_height is not None and tide_height < 4 and level >= 2:
        message += " • Low tide conditions may expose hazards"
    
    # Adjust warning level based on water temperature
    if water_temp is not None:
        if water_temp < 12:
            # Very cold water - risk of hypothermia
            if level < 3:
                level = 3
                message = "Cold water conditions • Limit swim time • Risk of hypothermia"
            else:
                message += " • Cold water - limit exposure"
        elif water_temp < 15:
            # Cool water - add advisory but don't bump level
            message += " • Water is cool"
    
    return {
        "level": level,
        "message": message,
        "tide_height": tide_height,
        "water_temp": water_temp
    }
