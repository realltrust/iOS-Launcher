import numpy as np
from moviepy.editor import VideoClip
from moviepy.audio.AudioClip import AudioArrayClip

def generate_cinematic_audio(duration=30, sample_rate=44100):
    """Generates a luxury 30-second generative ambient soundscape.
    Features a deep atmospheric drone and procedural crystalline wind chimes.
    """
    print("Composing 30-second generative audio track...")
    total_samples = sample_rate * duration
    t = np.linspace(0, duration, total_samples, endpoint=False)
    
    # 1. Premium Atmospheric Drone (A warm, low-frequency foundation)
    fade_envelope = np.sin(t * np.pi / duration) 
    drone = 0.15 * np.sin(2 * np.pi * 130.81 * t) + 0.10 * np.sin(2 * np.pi * 196.00 * t)
    audio_data = drone * fade_envelope
    
    # 2. Procedural Crystal Chimes (A major pentatonic scale hitting sequentially)
    chime_times = [1.0, 4.5, 8.0, 11.5, 15.0, 18.5, 22.0, 25.5]
    frequencies = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00] 
    
    for idx, start_sec in enumerate(chime_times):
        start_sample = int(start_sec * sample_rate)
        f = frequencies[idx % len(frequencies)]
        
        note_duration = 4.0
        note_samples = min(int(note_duration * sample_rate), total_samples - start_sample)
        
        t_note = np.arange(note_samples) / sample_rate
        decay_env = np.exp(-2.5 * t_note) 
        
        chime_signal = 0.35 * np.sin(2 * np.pi * f * t_note) + 0.08 * np.sin(2 * np.pi * (f * 2.3) * t_note)
        audio_data[start_sample:start_sample + note_samples] += chime_signal * decay_env

    audio_data = audio_data / np.max(np.abs(audio_data)) * 0.85
    return audio_data.reshape(-1, 1)


def make_video_frame(t):
    """Calculates a custom procedural frame at timestamp 't'.
    Generates a stylized 2D cartoon character dancing rhythmically to a beat.
    """
    w, h = 600, 600
    x = np.linspace(-1, 1, w)
    y = np.linspace(-1, 1, h)
    X, Y = np.meshgrid(x, y)
    
    # Rhythmic beat configurations (120 BPM -> 2 beats per second)
    beat_fast = np.pi * 4 * t
    beat_slow = np.pi * 2 * t
    
    # --- Structural Movement Math ---
    # Up-down body bounce and subtle side-to-side hip sway
    bounce = 0.05 * np.abs(np.sin(beat_slow))
    side_sway = 0.04 * np.sin(beat_slow * 0.5)
    
    # Core joint anchors
    pelvis_x, pelvis_y = side_sway, -0.15 + bounce
    neck_x, neck_y = side_sway * 1.2, 0.25 + bounce
    head_x, head_y = side_sway * 1.3, 0.43 + bounce
    head_radius = 0.13
    
    # Shoulder and hip width distribution
    sh_w, hip_w = 0.15, 0.10
    l_shoulder_x, l_shoulder_y = pelvis_x - sh_w, neck_y - 0.04
    r_shoulder_x, r_shoulder_y = pelvis_x + sh_w, neck_y - 0.04
    l_hip_x, l_hip_y = pelvis_x - hip_w, pelvis_y
    r_hip_x, r_hip_y = pelvis_x + hip_w, pelvis_y
    
    # Dancing Limbs (Dynamic sine-wave tracking for hands and feet)
    l_hand_x = l_shoulder_x - 0.18
    l_hand_y = l_shoulder_y + 0.10 + 0.22 * np.sin(beat_fast)
    
    r_hand_x = r_shoulder_x + 0.18
    r_hand_y = r_shoulder_y + 0.10 + 0.22 * np.cos(beat_fast)
    
    l_foot_x = l_hip_x - 0.04 + 0.04 * np.sin(beat_slow)
    l_foot_y = -0.65 + 0.12 * np.maximum(0, np.sin(beat_fast))
    
    r_foot_x = r_hip_x + 0.04 + 0.04 * np.cos(beat_slow)
    r_foot_y = -0.65 + 0.12 * np.maximum(0, np.cos(beat_fast))
    
    # --- Procedural Geometry Rendering Engine ---
    def get_segment_mask(ax, ay, bx, by, thickness=0.04):
        """Computes a smooth, anti-aliased vector line segment mask between two points."""
        abx, aby = bx - ax, by - ay
        apx, apy = X - ax, Y - ay
        ab_len_sq = abx**2 + aby**2 + 1e-6
        t_param = np.clip((apx * abx + apy * aby) / ab_len_sq, 0.0, 1.0)
        closest_x = ax + t_param * abx
        closest_y = ay + t_param * aby
        dist = np.sqrt((X - closest_x)**2 + (Y - closest_y)**2)
        return np.clip(0.5 - (dist - thickness) * 140, 0, 1)

    # Calculate structural body components
    head_dist = np.sqrt((X - head_x)**2 + (Y - head_y)**2)
    head_mask = np.clip(0.5 - (head_dist - head_radius) * 140, 0, 1)
    
    torso_mask = get_segment_mask(pelvis_x, pelvis_y, neck_x, neck_y, thickness=0.065)
    l_arm_mask = get_segment_mask(l_shoulder_x, l_shoulder_y, l_hand_x, l_hand_y, thickness=0.035)
    r_arm_mask = get_segment_mask(r_shoulder_x, r_shoulder_y, r_hand_x, r_hand_y, thickness=0.035)
    l_leg_mask = get_segment_mask(l_hip_x, l_hip_y, l_foot_x, l_foot_y, thickness=0.04)
    r_leg_mask = get_segment_mask(r_hip_x, r_hip_y, r_foot_x, r_foot_y, thickness=0.04)
    
    # Structural compilation
    body_mask = np.maximum.reduce([torso_mask, l_arm_mask, r_arm_mask, l_leg_mask, r_leg_mask])
    
    # Cartoon Face features (Eyes + talking/singing mouth)
    eye_y = head_y + 0.03
    l_eye_mask = np.clip(0.5 - (np.sqrt((X - (head_x - 0.045))**2 + (Y - eye_y)**2) - 0.018) * 140, 0, 1)
    r_eye_mask = np.clip(0.5 - (np.sqrt((X - (head_x + 0.045))**2 + (Y - eye_y)**2) - 0.018) * 140, 0, 1)
    
    mouth_open = 0.012 + 0.01 * np.abs(np.sin(beat_fast))
    mouth_mask = np.clip(0.5 - (np.sqrt((X - head_x)**2 + (Y - (head_y - 0.04))**2) - mouth_open) * 140, 0, 1)
    
    # --- Canvas Composition ---
    # Background: Dynamic neon disco canvas gradient
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    bg_glow = int(22 + 12 * np.sin(beat_slow))
    frame[:, :] = [bg_glow, 16, bg_glow + 12] 
    
    # Illuminated geometric neon stage floor
    floor_y_idx = int(h * 0.82)
    floor_pulse = int(45 + 25 * np.cos(beat_fast))
    frame[floor_y_idx:, :] = [20, floor_pulse, 65]
    
    # Color Maps: Head = Gold (255, 200, 45) | Body = Electric Teal (0, 215, 230)
    for c in range(3):
        ch_color = [0, 215, 230][c]
        hd_color = [255, 200, 45][c]
        
        # Layer drawing with alpha masks
        frame[:, :, c] = (frame[:, :, c] * (1 - body_mask) + (body_mask * ch_color)).astype(np.uint8)
        frame[:, :, c] = (frame[:, :, c] * (1 - head_mask) + (head_mask * hd_color)).astype(np.uint8)
        
        # Punch out facial expressions (Black contours)
        face_features = np.maximum.reduce([l_eye_mask, r_eye_mask, mouth_mask])
        frame[:, :, c] = (frame[:, :, c] * (1 - face_features)).astype(np.uint8)
        
    return frame

if __name__ == "__main__":
    print("==================================================")
    print("    Cube African Bank: Procedural Asset Compiler  ")
    print("==================================================\n")
    
    # 1. Compile audio array matrix
    raw_audio = generate_cinematic_audio(duration=30)
    audio_clip = AudioArrayClip(raw_audio, fps=44100)
    
    # 2. Render cartoon dancing animation frames
    print("Compiling 30-second procedural cartoon dancing animation (30 FPS)...")
    video_clip = VideoClip(make_video_frame, duration=30)
    
    # 3. Multiplex audio and video matrices into an MP4 container
    video_clip = video_clip.set_audio(audio_clip)
    video_clip.write_videofile(
        "cube_bank_dancing_cartoon.mp4", 
        fps=30, 
        codec="libx264", 
        audio_codec="aac",
        threads=4
    )
    
    print("\nProcessing complete! 'cube_bank_dancing_cartoon.mp4' is fully rendered.")