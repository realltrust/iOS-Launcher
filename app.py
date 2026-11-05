from flask import Flask, render_template, request, jsonify
import numpy as np
from moviepy.editor import VideoClip
from moviepy.audio.AudioClip import AudioArrayClip
import os

app = Flask(__name__)

# Ensure the static directory exists to hold generated videos
if not os.path.exists('static'):
    os.makedirs('static')

# -------------------------------------------------------------------------
# PROCEDURAL AUDIO GENERATION ENGINE
# -------------------------------------------------------------------------
def generate_dynamic_audio(prompt, duration=10, sample_rate=44100):
    """Generates audio frequencies tailored to the user's text prompt."""
    total_samples = sample_rate * duration
    t = np.linspace(0, duration, total_samples, endpoint=False)
    
    prompt = prompt.lower()
    
    # Mode A: Church / Choral Organ
    if "church" in prompt or "choir" in prompt or "praise" in prompt:
        # Deep church organ C-Major chord (C3 + E3 + G3)
        audio_data = 0.15 * np.sin(2 * np.pi * 130.81 * t) + 0.10 * np.sin(2 * np.pi * 164.81 * t) + 0.10 * np.sin(2 * np.pi * 196.00 * t)
        # Rhythmic singing pulses
        audio_data += 0.15 * np.sin(2 * np.pi * 329.63 * t) * np.abs(np.sin(t * np.pi * 2))
        
        # Mode D: Nature / Frogs / Bush Environment
    elif "frog" in prompt or "bush" in prompt or "nature" in prompt:
        print("Synthesizing organic frog croaks and cricket soundscape...")
        # Low frequency "ribbit" croak (A raw, gated 90Hz tone repeating tightly)
        croak_envelope = np.abs(np.sin(t * np.pi * 1.5)) ** 12  # Sharp rhythmic bursts
        croak = 0.25 * np.sin(2 * np.pi * 90.0 * t) * croak_envelope
        
        # High-pitched cricket chirps (3500Hz burst oscillations)
        cricket_envelope = (np.sin(t * np.pi * 6) > 0.85).astype(float)
        cricket = 0.04 * np.sin(2 * np.pi * 3500 * t) * cricket_envelope
        
        audio_data = croak + cricket

    # Mode B: Cartoon / Dancing Disco Electronic Beat
    elif "dance" in prompt or "cartoon" in prompt or "disco" in prompt:
        # Heavy sub-bass pulse (BPM driven)
        kick = np.sign(np.sin(2 * np.pi * 2 * t)) * np.exp(-10 * (t % 0.5)) * 0.3
        # Off-beat synth hi-hat
        hat = np.random.normal(0, 1, total_samples) * np.exp(-40 * ((t + 0.25) % 0.5)) * 0.05
        audio_data = kick + hat
        
    # Mode C: Default / Flower / Ambient Abstract
    else:
        # Elegant atmospheric chime pad
        base_drone = 0.2 * np.sin(2 * np.pi * 220.0 * t) # A3 drone
        # Generate random glittering notes based on string length of prompt
        seed_freq = 440.0 + (len(prompt) * 10)
        glimmer = 0.1 * np.sin(2 * np.pi * seed_freq * t) * np.abs(np.sin(t * 0.5))
        audio_data = base_drone + glimmer

    # Normalize audio
    max_val = np.max(np.abs(audio_data))
    if max_val > 0:
        audio_data = audio_data / max_val * 0.8
        
    return audio_data.reshape(-1, 1)


# -------------------------------------------------------------------------
# PROCEDURAL GEOMETRY VIDEO ENGINE
# -------------------------------------------------------------------------
def make_dynamic_frame(t, prompt):
    """The ultimate modular frame builder. Handles office environments, 
    laptops, disco elements, and characters working while dancing.
    """
    w, h = 400, 400
    x = np.linspace(-1, 1, w)
    y = np.linspace(-1, 1, h)
    X, Y = np.meshgrid(x, y)
    
    prompt = prompt.lower()
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    
    # ---------------------------------------------------------------------
    # 1. ENVIRONMENT LAYER (Office Cubicle vs. Neon Disco)
    # ---------------------------------------------------------------------
    is_party = any(k in prompt for k in ["party", "dance", "disco"])
    is_work = any(k in prompt for k in ["work", "office", "laptop", "desk"])
    
    if is_party and is_work:
        # Split the difference: Deep office blue mixed with flashing neon pink
        frame[:, :] = [int(30 + 20 * np.sin(t*4)), 25, 60]
    elif is_party:
        frame[:, :] = [int(40 + 30 * np.sin(t*3)), 10, int(50 + 40 * np.cos(t*3))]
    elif is_work:
        frame[:, :] = [30, 35, 45] # Corporate Grey-Blue
    else:
        frame[:, :] = [15, 15, 20] # Default dark background

    # ---------------------------------------------------------------------
    # 2. PROCEDURAL BACKGROUND PROPS (Disco Ball & Office Desk)
    # ---------------------------------------------------------------------
    if is_party:
        # Floating Disco Ball at the top center
        ball_dist = np.sqrt(X**2 + (Y - 0.75)**2)
        frame[ball_dist < 0.12] = [200, 220, 255] # Silver core
        
        # Flashing light rays using angular sine waves
        theta = np.arctan2(Y - 0.75, X)
        rays = (np.sin(theta * 12 + t * 5) > 0.7) & (Y < 0.6)
        frame[rays] = (frame[rays] * 0.6 + np.array([0, 150, 150]) * 0.4).astype(np.uint8)

    if is_work:
        # Office Desk running across the bottom half
        desk_mask = (Y < -0.3) & (Y > -0.7)
        frame[desk_mask] = [70, 50, 40] # Wooden Desk Mahogany
        
        # Desk edge highlight
        frame[np.abs(Y - (-0.3)) < 0.015] = [100, 80, 65]

    # ---------------------------------------------------------------------
    # 3. THE MULTI-TASKING PEOPLE ENGINE
    # ---------------------------------------------------------------------
    # Render two coworkers/party animals side by side
    people_positions = [-0.35, 0.35]
    
    for idx, p_x in enumerate(people_positions):
        # Rhythm engine: bounce them to the beat
        bounce = 0.05 * np.abs(np.sin(t * 5 + idx))
        p_y = -0.1 + bounce
        
        # Draw Head
        head = np.sqrt((X - p_x)**2 + (Y - (p_y + 0.25))**2) < 0.10
        frame[head] = [240, 190, 150] # Skin tone
        
        # Draw Torso
        body = (np.abs(X - p_x) < 0.12) & (Y < p_y + 0.15) & (Y > p_y - 0.2)
        frame[body] = [40, 100, 180] if idx % 2 == 0 else [180, 50, 90] # Clothes
        
        # --- Multi-Tasking Arm Vectors ---
        if is_work and is_party:
            # LEFT HAND: Glued to the desk working on the laptop
            l_arm = (X > p_x - 0.25) & (X < p_x) & (np.abs(Y - (p_y - 0.1)) < 0.02)
            frame[l_arm] = [240, 190, 150]
            
            # RIGHT HAND: Waving in the air partying!
            wave_y = p_y + 0.25 + 0.12 * np.sin(t * 8 + idx)
            r_arm = (X > p_x) & (X < p_x + 0.2) & (Y > p_y - 0.1) & (Y < wave_y) & (np.abs((X - p_x) - (Y - p_y)*0.5) < 0.04)
            frame[r_arm] = [240, 190, 150]
            
        elif is_party:
            # BOTH HANDS UP
            arms = (np.abs(Y - (p_y + 0.2 + 0.1 * np.sin(t*6 + idx))) < 0.02) & (np.abs(X - p_x) < 0.25)
            frame[arms] = [240, 190, 150]
            
        elif is_work:
            # BOTH HANDS DOWN TYPING
            typing_arms = (np.abs(Y - (p_y - 0.1)) < 0.02) & (np.abs(X - p_x) < 0.22)
            frame[typing_arms] = [240, 190, 150]

        # ---------------------------------------------------------------------
        # 4. COMPUTER HARDWARE LAYER (Spawns directly in front of each person)
        # ---------------------------------------------------------------------
        if is_work:
            lap_x = p_x + 0.05
            lap_y = -0.22
            
            # Laptop Screen (Angled box)
            screen = (X > lap_x - 0.08) & (X < lap_x + 0.08) & (Y > lap_y) & (Y < lap_y + 0.12)
            frame[screen] = [50, 55, 65] # Laptop chassis
            
            # Glowing Monitor Light emission Matrix
            glow = (X > lap_x - 0.07) & (X < lap_x + 0.07) & (Y > lap_y + 0.01) & (Y < lap_y + 0.11)
            if is_party:
                # Cyberpunk party screen color matrix
                frame[glow] = [0, 255, 255] 
            else:
                # Boring Excel Spreadsheet White/Blue glow
                frame[glow] = [200, 230, 255]

            # Keyboard base flat on the desk
            keyboard = (X > lap_x - 0.09) & (X < lap_x + 0.09) & (Y > lap_y - 0.06) & (Y <= lap_y)
            frame[keyboard] = [30, 32, 38]

    return frame

# -------------------------------------------------------------------------
# FLASK ROUTING
# -------------------------------------------------------------------------
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def handle_generation():
    user_data = request.json
    user_prompt = user_data.get('prompt', 'Default Flower')
    
    print(f"User requested: '{user_prompt}'")
    
    # 1. Compile customized audio array
    duration = 8  # 8 seconds is the sweet spot for fast on-demand web rendering
    audio_matrix = generate_dynamic_audio(user_prompt, duration=duration)
    audio_clip = AudioArrayClip(audio_matrix, fps=44100)
    
    # 2. Render targeted geometry frames
    # We pass the custom user prompt down into the math frame function
    video_clip = VideoClip(lambda t: make_dynamic_frame(t, user_prompt), duration=duration)
    video_clip = video_clip.set_audio(audio_clip)
    
    # 3. Export to static folder (Overwrite previous to keep server lightweight)
    output_filename = "static/generated_output.mp4"
    video_clip.write_videofile(
        output_filename,
        fps=24, 
        codec="libx264",
        audio_codec="aac",
        logger=None # Silences terminal output spam for smooth server logs
    )
    
    # Send success response back to HTML frontend page
    return jsonify({"success": True, "video_url": f"/{output_filename}?t={os.urandom(4).hex()}"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)