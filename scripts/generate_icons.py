import zlib
import struct
import math
import os

def create_png(width, height, get_pixel_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend([clamp(int(r)), clamp(int(g)), clamp(int(b)), clamp(int(a))])
    
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    return bytes(png)

def clamp(val, min_v=0, max_v=255):
    return max(min_v, min(max_v, val))

def render_app_icon(x, y, width, height, is_maskable=False):
    # Normalized coords 0 to 1
    nx = x / (width - 1)
    ny = y / (height - 1)
    
    # Background corner radius (for non-maskable)
    corner_radius = 0.22 if not is_maskable else 0.0
    
    # Check rounded rect boundary
    if not is_maskable:
        cr_px = corner_radius * width
        in_corner = False
        dx = 0
        dy = 0
        if x < cr_px and y < cr_px:
            dx, dy = cr_px - x, cr_px - y
            in_corner = True
        elif x > width - 1 - cr_px and y < cr_px:
            dx, dy = x - (width - 1 - cr_px), cr_px - y
            in_corner = True
        elif x < cr_px and y > height - 1 - cr_px:
            dx, dy = cr_px - x, y - (height - 1 - cr_px)
            in_corner = True
        elif x > width - 1 - cr_px and y > height - 1 - cr_px:
            dx, dy = x - (width - 1 - cr_px), y - (height - 1 - cr_px)
            in_corner = True
            
        if in_corner:
            dist = math.sqrt(dx * dx + dy * dy)
            if dist > cr_px:
                return (0, 0, 0, 0)
            elif dist > cr_px - 1.0:
                alpha = int(255 * (cr_px - dist))
                # will blend alpha later
            else:
                alpha = 255
        else:
            alpha = 255
    else:
        alpha = 255

    # Emerald-Teal linear gradient: (5, 150, 105) to (15, 118, 110)
    t = (nx + ny) * 0.5
    bg_r = int(5 + t * (15 - 5))
    bg_g = int(150 + t * (118 - 150))
    bg_b = int(105 + t * (110 - 105))

    # Scale and center offset for content
    scale = 0.72 if is_maskable else 0.88
    cx = (nx - 0.5) / scale + 0.5
    cy = (ny - 0.5) / scale + 0.5

    # If outside valid normalized range, return bg
    if cx < 0 or cx > 1 or cy < 0 or cy > 1:
        return (bg_r, bg_g, bg_b, alpha)

    # Soft radial glow in upper center
    glow_dx = cx - 0.5
    glow_dy = cy - 0.35
    glow_dist = math.sqrt(glow_dx*glow_dx + glow_dy*glow_dy)
    if glow_dist < 0.4:
        glow_factor = (1.0 - glow_dist / 0.4) * 0.3
        bg_r = clamp(int(bg_r + 52 * glow_factor))
        bg_g = clamp(int(bg_g + 211 * glow_factor))
        bg_b = clamp(int(bg_b + 153 * glow_factor))

    # Shield outline / Vault
    # Shield shape approx: top flat with curved apex, straight sides, curved bottom to point
    in_shield = False
    shield_edge = False
    if 0.22 <= cx <= 0.78 and 0.16 <= cy <= 0.84:
        w_rel = abs(cx - 0.5) / 0.28
        if cy < 0.50:
            allowed_w = 1.0
        else:
            rel_y = (cy - 0.50) / 0.34
            allowed_w = 1.0 - rel_y * rel_y
        
        if w_rel <= allowed_w:
            in_shield = True
            if w_rel > allowed_w - 0.05 or cy < 0.18:
                shield_edge = True

    r, g, b = bg_r, bg_g, bg_b

    if in_shield:
        if shield_edge:
            r = clamp(r + 70)
            g = clamp(g + 80)
            b = clamp(b + 80)
        else:
            r = clamp(r + 18)
            g = clamp(g + 24)
            b = clamp(b + 24)

    # Family Figures:
    # Parent Left Head (0.40, 0.38), r=0.06
    d_pl = math.hypot(cx - 0.39, cy - 0.38)
    if d_pl < 0.06:
        return (255, 255, 255, alpha)

    # Parent Right Head (0.61, 0.38), r=0.06
    d_pr = math.hypot(cx - 0.61, cy - 0.38)
    if d_pr < 0.06:
        return (255, 255, 255, alpha)

    # Left Torso Arc
    if 0.30 <= cx <= 0.48 and 0.46 <= cy <= 0.58:
        arc_d = abs(math.hypot(cx - 0.39, cy - 0.56) - 0.10)
        if arc_d < 0.024:
            return (255, 255, 255, alpha)

    # Right Torso Arc
    if 0.52 <= cx <= 0.70 and 0.46 <= cy <= 0.58:
        arc_d = abs(math.hypot(cx - 0.61, cy - 0.56) - 0.10)
        if arc_d < 0.024:
            return (255, 255, 255, alpha)

    # Golden Coin / Vault at Bottom Center (0.50, 0.66), r=0.12
    d_coin = math.hypot(cx - 0.50, cy - 0.66)
    if d_coin < 0.12:
        # Golden gradient
        coin_t = (cx - 0.38 + cy - 0.54) / 0.24
        coin_r = int(254 - coin_t * (254 - 245))
        coin_g = int(240 - coin_t * (240 - 158))
        coin_b = int(138 - coin_t * (138 - 11))
        
        # Inner dashed ring at 0.095
        if abs(d_coin - 0.095) < 0.01:
            return (217, 119, 6, alpha)

        # Euro symbol in center
        # Arc of Euro
        d_euro_arc = math.hypot(cx - 0.51, cy - 0.66)
        if 0.045 <= d_euro_arc <= 0.068 and cx <= 0.51:
            return (120, 53, 15, alpha)
        # Euro horizontal bars
        if (abs(cy - 0.645) < 0.01 or abs(cy - 0.675) < 0.01) and (0.44 <= cx <= 0.54):
            return (120, 53, 15, alpha)

        return (coin_r, coin_g, coin_b, alpha)

    return (r, g, b, alpha)

os.makedirs('public', exist_ok=True)

# Generate 192x192
png_192 = create_png(192, 192, lambda x,y,w,h: render_app_icon(x,y,w,h, False))
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(png_192)
print("Created public/pwa-192x192.png")

# Generate 512x512
png_512 = create_png(512, 512, lambda x,y,w,h: render_app_icon(x,y,w,h, False))
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(png_512)
print("Created public/pwa-512x512.png")

# Generate 512x512 maskable (safe-zone padding)
png_mask = create_png(512, 512, lambda x,y,w,h: render_app_icon(x,y,w,h, True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(png_mask)
print("Created public/pwa-maskable-512x512.png")

# Generate 180x180 apple-touch-icon
png_apple = create_png(180, 180, lambda x,y,w,h: render_app_icon(x,y,w,h, False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)
print("Created public/apple-touch-icon.png")

# Generate 48x48 favicon.ico (valid png inside)
png_48 = create_png(48, 48, lambda x,y,w,h: render_app_icon(x,y,w,h, False))
with open('public/favicon.ico', 'wb') as f:
    f.write(png_48)
print("Created public/favicon.ico")
