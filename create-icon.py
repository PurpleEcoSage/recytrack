#!/usr/bin/env python3
"""
Générateur d'icône RecyTrack
Crée un logo avec une feuille stylisée et le symbole de recyclage
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_recytrack_logo(size=512):
    """Crée le logo RecyTrack"""
    # Créer une image avec fond transparent
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Couleurs
    green_primary = '#22C55E'
    green_dark = '#16A34A'
    white = '#FFFFFF'
    
    # Centre et rayon
    center = size // 2
    radius = int(size * 0.45)
    
    # Dessiner le cercle de fond
    draw.ellipse(
        [(center - radius, center - radius), 
         (center + radius, center + radius)],
        fill=green_primary
    )
    
    # Dessiner une feuille stylisée
    leaf_points = []
    leaf_center_x = center
    leaf_center_y = center - radius * 0.2
    leaf_width = radius * 0.6
    leaf_height = radius * 0.8
    
    # Contour de la feuille (courbe de Bézier simplifiée)
    steps = 50
    for i in range(steps + 1):
        t = i / steps
        # Côté gauche
        x = leaf_center_x - leaf_width * (1 - t) * math.sin(t * math.pi)
        y = leaf_center_y - leaf_height * t + leaf_height * 0.3 * math.sin(t * math.pi * 2)
        leaf_points.append((x, y))
    
    for i in range(steps, -1, -1):
        t = i / steps
        # Côté droit
        x = leaf_center_x + leaf_width * (1 - t) * math.sin(t * math.pi)
        y = leaf_center_y - leaf_height * t + leaf_height * 0.3 * math.sin(t * math.pi * 2)
        leaf_points.append((x, y))
    
    # Dessiner la feuille
    draw.polygon(leaf_points, fill=white)
    
    # Dessiner la nervure centrale
    draw.line(
        [(leaf_center_x, leaf_center_y + leaf_height * 0.4),
         (leaf_center_x, leaf_center_y - leaf_height * 0.8)],
        fill=green_primary,
        width=max(3, size // 100)
    )
    
    # Dessiner les nervures latérales
    for i in range(3):
        offset = (i + 1) * leaf_height * 0.2
        # Nervure gauche
        draw.line(
            [(leaf_center_x, leaf_center_y - offset),
             (leaf_center_x - leaf_width * 0.3, leaf_center_y - offset - leaf_height * 0.1)],
            fill=green_primary,
            width=max(2, size // 150)
        )
        # Nervure droite
        draw.line(
            [(leaf_center_x, leaf_center_y - offset),
             (leaf_center_x + leaf_width * 0.3, leaf_center_y - offset - leaf_height * 0.1)],
            fill=green_primary,
            width=max(2, size // 150)
        )
    
    # Ajouter le symbole de recyclage (3 flèches)
    recycle_center_y = center + radius * 0.4
    arrow_radius = radius * 0.25
    
    for angle in [0, 120, 240]:
        # Calculer la position de chaque flèche
        angle_rad = math.radians(angle)
        arrow_x = center + arrow_radius * math.cos(angle_rad)
        arrow_y = recycle_center_y + arrow_radius * math.sin(angle_rad)
        
        # Dessiner une flèche courbée
        arrow_points = []
        for i in range(20):
            t = i / 19
            curve_angle = angle_rad + t * math.pi / 3
            r = arrow_radius * 0.8 * (1 - t * 0.3)
            x = center + r * math.cos(curve_angle)
            y = recycle_center_y + r * math.sin(curve_angle)
            arrow_points.append((x, y))
        
        # Pointe de flèche
        tip_angle = angle_rad + math.pi / 3
        tip_x = center + arrow_radius * 0.6 * math.cos(tip_angle)
        tip_y = recycle_center_y + arrow_radius * 0.6 * math.sin(tip_angle)
        
        # Dessiner la flèche
        if len(arrow_points) > 1:
            draw.line(arrow_points, fill=white, width=max(4, size // 80))
            
            # Pointe
            draw.polygon([
                (tip_x, tip_y),
                (tip_x - 8 * math.cos(tip_angle - math.pi/6), 
                 tip_y - 8 * math.sin(tip_angle - math.pi/6)),
                (tip_x - 8 * math.cos(tip_angle + math.pi/6), 
                 tip_y - 8 * math.sin(tip_angle + math.pi/6))
            ], fill=white)
    
    return img

def generate_icons():
    """Génère toutes les tailles d'icônes nécessaires"""
    sizes = {
        'icon.png': 512,
        'icon@2x.png': 1024,
        'icon-256.png': 256,
        'icon-128.png': 128,
        'icon-64.png': 64,
        'icon-48.png': 48,
        'icon-32.png': 32,
        'icon-16.png': 16
    }
    
    # Créer le dossier icons s'il n'existe pas
    os.makedirs('electron/icons', exist_ok=True)
    os.makedirs('frontend/public', exist_ok=True)
    
    # Générer l'icône principale
    main_icon = create_recytrack_logo(1024)
    
    # Sauvegarder toutes les tailles
    for filename, size in sizes.items():
        resized = main_icon.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(f'electron/icons/{filename}', 'PNG')
        print(f"✅ Créé: electron/icons/{filename}")
    
    # Créer aussi favicon pour le web
    favicon_sizes = [16, 32, 192, 512]
    for size in favicon_sizes:
        resized = main_icon.resize((size, size), Image.Resampling.LANCZOS)
        if size == 32:
            resized.save('frontend/public/favicon.ico', 'ICO')
            print(f"✅ Créé: frontend/public/favicon.ico")
        resized.save(f'frontend/public/logo{size}.png', 'PNG')
        print(f"✅ Créé: frontend/public/logo{size}.png")
    
    # Créer l'icône Windows .ico avec plusieurs résolutions
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icons = []
    for size in icon_sizes:
        icons.append(main_icon.resize(size, Image.Resampling.LANCZOS))
    
    icons[0].save('electron/icons/icon.ico', format='ICO', sizes=icon_sizes)
    print(f"✅ Créé: electron/icons/icon.ico (multi-résolution)")

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw
        generate_icons()
        print("\n🎨 Toutes les icônes ont été générées avec succès !")
    except ImportError:
        print("❌ Pillow n'est pas installé. Installez-le avec : pip install Pillow")
        
        # Créer un fichier d'instructions pour générer l'icône
        with open('electron/icons/CREATE_ICON.txt', 'w') as f:
            f.write("""
Pour créer l'icône RecyTrack :

1. Installez Python et Pillow :
   pip install Pillow

2. Exécutez :
   python create-icon.py

Ou utilisez un éditeur d'image pour créer :
- Un logo avec une feuille verte et le symbole de recyclage
- Format : PNG avec fond transparent
- Tailles : 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512
- Sauvegarder comme icon.ico (multi-résolution) dans ce dossier
""")