/* HW Talent gallery lists.
   To add a photo: put the file in assets/img/work, then add one line to the right list, for example
     { "src": "assets/img/work/your-photo.jpg", "w": 1600, "h": 2000, "cat": "aerialists", "label": "Aerial hoop", "alt": "Describe the photo" },
   cat must match an id in the category list above it. w and h are the photo's pixel size. thumb is optional (a smaller copy for the grid).
   Labels name the discipline only: no performer names, no event names.
   Photos are always shown whole, never cropped. A gallery with no photos stays hidden. */
window.HW_ACT_CATS = [["aerialists", "Aerialists"], ["acrobats", "Acrobats"], ["contortionists", "Contortionists"], ["fire-dancers", "Fire dancers"], ["fire-breathers", "Fire breathers"], ["led-dancers", "LED dancers"], ["stilt-walkers", "Stilt walkers"], ["mermaids", "Mermaids"], ["pole-dancers", "Pole dancers"], ["dancers", "Dancers"], ["clowns", "Clowns"], ["ball-walkers", "Ball walkers"], ["skaters", "Skaters"], ["extreme-sports", "Extreme sports"], ["models", "Models"], ["pas", "PAs"], ["djs", "DJs"]];

window.HW_ACTS = [
  {"src": "assets/img/work/fire-01-1800.jpg", "thumb": "assets/img/work/fire-01-900.jpg", "w": 1440, "h": 1800, "cat": "fire-dancers", "label": "Fire", "alt": "A fire performer breathes a ribbon of flame between two lit torches against a dusk sky"},
  {"src": "assets/img/work/character-01-1800.jpg", "thumb": "assets/img/work/character-01-900.jpg", "w": 1200, "h": 1800, "cat": "clowns", "label": "Character", "alt": "A character performer in dark clown make-up reaches toward the camera with a red balloon animal, lit in red"},
  {"src": "assets/img/work/aerial-hoop-01-1800.jpg", "thumb": "assets/img/work/aerial-hoop-01-900.jpg", "w": 1800, "h": 1200, "cat": "aerialists", "label": "Aerial hoop", "alt": "An aerialist hangs inverted from an aerial hoop against a black backdrop"},
  {"src": "assets/img/work/fire-breathing-01-1800.jpg", "thumb": "assets/img/work/fire-breathing-01-900.jpg", "w": 1440, "h": 1800, "cat": "fire-breathers", "label": "Fire breathing", "alt": "A fire breather sends a tall column of flame into a black sky"},
  {"src": "assets/img/work/led-hoops-01-1800.jpg", "thumb": "assets/img/work/led-hoops-01-900.jpg", "w": 1800, "h": 1441, "cat": "led-dancers", "label": "LED hoops", "alt": "A performer spins two glowing LED hoops on a stage washed in red light"}
];

window.HW_COSTUME_CATS = [["couture", "Couture"], ["stilts", "Stilts"], ["character", "Character"], ["light", "Fire and light"]];

window.HW_COSTUMES = [
];
