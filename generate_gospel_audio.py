import numpy as np
from moviepy.editor import VideoClip
from moviepy.audio.AudioClip import AudioArrayClip

def generate_gospel_audio(duration=30, sample_rate=44100):
    """Generates a 30-second procedural church organ and choir arrangement.
    Simulates a chord progression (C - F - G - C) with rhythmic singing pulses.
    """
    print("Composing 30-second choral organ soundscape...")
    total_samples = sample_rate * duration
    t = np.linspace(0, duration, total_samples, endpoint=False)
    
    # 1. Rich Church Organ Engine (Additive synthesis of basic pipe intervals)
    # Chord frequencies for progression: C Maj, F Maj, G Maj, C Maj changing every 4 seconds
    def get_organ_chord(time_arr):
        chord_track = np.zeros_like(time_arr)
        # 4-second blocks
        block_len = 4.0
        for start in range(0, int(duration), 4):
            mask = (time_arr >= start) & (time_arr < start + 4)
            step = (start // 4) % 4
            
            # Fundamentals based on progression step
            if step == 0 or step == 3:    # C Major (C3, E3, G3, C4)
                freqs = [130.81, 164.81, 196.00, 261.63]
            elif step == 1:               # F Major (F3, A3, C4, F4)
                freqs = [174.61, 220.00, 261.63, 349.23]
            else:                         # G Major (G3, B3, D4, G4)
                freqs = [196.00, 246.94, 293.66, 392.00]
                
            for f in freqs:
                # Basic tone + rich pipe organ harmonics (sub-octaves and fifths)
                chord_track[mask] += 0.12 * np.sin(2 * np.pi * f * time_arr[mask])
                chord_track[mask] += 0.06 * np.sin(2 * np.pi * (f * 1.5) * time_arr[mask])
                chord_track[mask] += 0.03 * np.sin(2 * np.pi * (f * 2.0) * time_arr[mask])
        return chord_track

    organ_base = get_organ_chord(t)
    
    # 2. Rhythmic "Hallelujah" Vocal Carrier Wave (120 BPM modulation)
    # Creates a chanting amplitude envelope simulating syllables: "Hal-le-lu-jah"
    beat_cadence = np.abs(np.sin(t * np.pi * 2)) # Rhythmic pulsing
    choir_lead = 0.15 * np.sin(2 * np.pi * 329.63 * t) * beat_cadence # E4 vocal pitch
    choir_harm = 0.10 * np.sin(2 * np.pi * 392.00 * t) * beat_cadence # G4 harmony pitch
    
    # Combine components and apply master fade out at 30s
    master_fade = np.clip((duration - t) / 2.0, 0, 1)
    audio_data = (organ_base + choir_lead + choir_harm) * master_fade
    
    # Normalize to safe levels
    audio_data = audio_data / np.max(np.abs(audio_data)) * 0.82
    return audio_data.reshape(-1, 1)


def make_video_frame(t):
    """Calculates a custom procedural frame at timestamp 't'.
    Renders 3 cartoon choir members with upraised hands inside a church.
    """
    w, h = 600, 600
    x = np.linspace(-1, 1, w)
    y = np.linspace(-1, 1, h)
    X, Y = np.meshgrid(x, y)
    
    # Global Timing Clocks
    beat_fast = np.pi * 4 * t  # Up-down waving speed
    beat_slow = np.pi * 2 * t  # Swaying speed
    
    # --- Layer 1: Procedural Church Architecture Background ---
    # Dark gothic sanctuary walls
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    frame[:, :] = [22, 18, 28] 
    
    # Stained Glass Window Arch Mask
    window_dist = np.sqrt(X**2 + (Y - 0.2)**2)
    window_mask = np.clip(0.5 - (window_dist - 0.42) * 120, 0, 1)
    # Cut off bottom of arch to make it a classic flat-bottom cathedral window
    window_mask *= np.clip((Y - (-0.15)) * 120, 0, 1)
    
    # Shifting stained glass colors inside the window mask
    win_r = int(110 + 40 * np.sin(beat_slow * 0.2))
    win_g = int(40 + 30 * np.cos(beat_slow * 0.3))
    win_b = int(160 + 50 * np.sin(beat_slow * 0.1))
    
    for c, val in enumerate([win_r, win_g, win_b]):
        frame[:, :, c] = (frame[:, :, c] * (1 - window_mask) + window_mask * val).astype(np.uint8)
        
    # Holy Glowing Latin Cross in the center back
    cross_vert = np.clip(0.5 - (np.abs(X) - 0.035) * 150, 0, 1) * np.clip(0.5 - (np.abs(Y - 0.25) - 0.35) * 150, 0, 1)
    cross_horiz = np.clip(0.5 - (np.abs(X) - 0.22) * 150, 0, 1) * np.clip(0.5 - (np.abs(Y - 0.40) - 0.035) * 150, 0, 1)
    cross_mask = np.maximum(cross_vert, cross_horiz)
    
    # Inject bright warm yellow glow for the cross
    for c, val in enumerate([255, 225, 140]):
        frame[:, :, c] = (frame[:, :, c] * (1 - cross_mask) + cross_mask * val).astype(np.uint8)

    # --- Layer 2: The Three Choir Members Engine ---
    def get_segment_mask(ax, ay, bx, by, thickness=0.035):
        abx, aby = bx - ax, by - ay
        apx, apy = X - ax, Y - ay
        ab_len_sq = abx**2 + aby**2 + 1e-6
        t_param = np.clip((apx * abx + apy * aby) / ab_len_sq, 0.0, 1.0)
        closest_x = ax + t_param * abx
        closest_y = ay + t_param * aby
        dist = np.sqrt((X - closest_x)**2 + (Y - closest_y)**2)
        return np.clip(0.5 - (dist - thickness) * 140, 0, 1)

    # Render each person sequentially (Left, Center, Right)
    # We alter their phase offsets so they bounce naturally out of step
    person_offsets = [-0.42, 0.0, 0.42]
    phase_shifts = [0.0, 0.6, 1.2]
    robe_colors = [[160, 30, 60], [220, 220, 240], [40, 80, 160]] # Crimson, Choir White, Royal Blue
    
    for idx, x_center in enumerate(person_offsets):
        phase = phase_shifts[idx]
        
        # Unique movement translations per character
        p_bounce = 0.04 * np.abs(np.sin(beat_slow + phase))
        p_sway = 0.02 * np.sin(beat_slow * 0.5 + phase)
        
        # Skeleton Coordinates
        pelvis_x, pelvis_y = x_center + p_sway, -0.3 + p_bounce
        neck_x, neck_y = x_center + p_sway * 1.1, 0.08 + p_bounce
        head_x, head_y = x_center + p_sway * 1.15, 0.22 + p_bounce
        head_radius = 0.09
        
        # Upraised Hands in Praise (Y values are pushed way up above shoulders)
        l_hand_x = pelvis_x - 0.14
        l_hand_y = neck_y + 0.12 + 0.08 * np.sin(beat_fast + phase)
        
        r_hand_x = pelvis_x + 0.14
        r_hand_y = neck_y + 0.12 + 0.08 * np.cos(beat_fast + phase)
        
        # Generate Component Geometry Masks
        h_dist = np.sqrt((X - head_x)**2 + (Y - head_y)**2)
        h_mask = np.clip(0.5 - (h_dist - head_radius) * 140, 0, 1)
        
        # Traditional conical choir robe outline via segment calculation
        torso_mask = get_segment_mask(pelvis_x, pelvis_y, neck_x, neck_y, thickness=0.06)
        l_arm_mask = get_segment_mask(pelvis_x - 0.04, neck_y - 0.03, l_hand_x, l_hand_y, thickness=0.028)
        r_arm_mask = get_segment_mask(pelvis_x + 0.04, neck_y - 0.03, r_hand_x, r_hand_y, thickness=0.028)
        
        # Broaden base robe width using simple geometry mapping
        robe_skirt = np.clip(0.5 - (np.abs(X - pelvis_x) - 0.12) * 80, 0, 1) * np.clip((pelvis_y - Y) * 140, 0, 1) * np.clip((Y - (-0.7)) * 140, 0, 1)
        
        clothing_mask = np.maximum.reduce([torso_mask, l_arm_mask, r_arm_mask, robe_skirt])
        
        # Singing facial characteristics (Wide open round singing mouths)
        eye_y = head_y + 0.02
        eye_l = np.clip(0.5 - (np.sqrt((X - (head_x - 0.03))**2 + (Y - eye_y)**2) - 0.012) * 140, 0, 1)
        eye_r = np.clip(0.5 - (np.sqrt((X - (head_x + 0.03))**2 + (Y - eye_y)**2) - 0.012) * 140, 0, 1)
        
        # Mouth opening scales dynamically with the loud musical cadence peaks
        singing_aperture = 0.012 + 0.016 * np.abs(np.sin(beat_fast + phase))
        mouth_mask = np.clip(0.5 - (np.sqrt((X - head_x)**2 + (Y - (head_y - 0.035))**2) - singing_aperture) * 140, 0, 1)
        face_features = np.maximum.reduce([eye_l, eye_r, mouth_mask])
        
        # Blending current character pass onto the core canvas frame matrix
        skin_color = [225, 175, 125]
        robe_rgb = robe_colors[idx]
        
        for c in range(3):
            # Draw individual colored robes
            frame[:, :, c] = (frame[:, :, c] * (1 - clothing_mask) + (clothing_mask * robe_rgb[c])).astype(np.uint8)
            # Draw individual skin tones
            frame[:, :, c] = (frame[:, :, c] * (1 - h_mask) + (h_mask * skin_color[c])).astype(np.uint8)
            # Clip out dark lines for singing faces
            frame[:, :, c] = (frame[:, :, c] * (1 - face_features)).astype(np.uint8)

    # --- Layer 3: Church Wood Pew Foreground ---
    pew_y_idx = int(h * 0.84)
    frame[pew_y_idx:, :] = [75, 45, 25] # Solid rich mahogany wood color block
    pew_lip = int(h * 0.84)
    frame[pew_lip:pew_lip+8, :] = [100, 65, 40] # Highlighted top ledge rail
        
    return frame

if __name__ == "__main__":
    print("==================================================")
    print("    Church Choir: Procedural Asset Compiler        ")
    print("==================================================\n")
    
    # 1. Compile 30s organ audio matrix
    raw_audio = generate_gospel_audio(duration=30)
    audio_clip = AudioArrayClip(raw_audio, fps=44100)
    
    # 2. Render math animation frames 
    print("Compiling 30-second procedural church choir animation (30 FPS)...")
    video_clip = VideoClip(make_video_frame, duration=30)
    
    # 3. Render and bind layers to target file
    video_clip = video_clip.set_audio(audio_clip)
    video_clip.write_videofile(
        "church_choir_hallelujah.mp4", 
        fps=30, 
        codec="libx264", 
        audio_codec="aac",
        threads=4
    )
    
    print("\nProcessing complete! 'church_choir_hallelujah.mp4' has been saved.")