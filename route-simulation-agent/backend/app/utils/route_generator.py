import math

# Approximate lat/lng for all 38 Tamil Nadu district headquarters (matching frontend)
TN_DISTRICTS = {
  'Ariyalur':        [11.1416, 79.0765],
  'Chengalpattu':    [12.6921, 79.9771],
  'Chennai':         [13.0827, 80.2707],
  'Coimbatore':      [11.0168, 76.9558],
  'Cuddalore':       [11.7480, 79.7714],
  'Dharmapuri':      [12.1211, 78.1582],
  'Dindigul':        [10.3624, 77.9695],
  'Erode':           [11.3410, 77.7172],
  'Kallakurichi':    [11.7380, 78.9607],
  'Kancheepuram':    [12.8342, 79.7036],
  'Kanyakumari':     [8.0883,  77.5385],
  'Karur':           [10.9601, 78.0766],
  'Krishnagiri':     [12.5186, 78.2137],
  'Madurai':         [9.9252,  78.1198],
  'Mayiladuthurai':  [11.1035, 79.6515],
  'Nagapattinam':    [10.7672, 79.8449],
  'Namakkal':        [11.2189, 78.1674],
  'Nilgiris':        [11.4916, 76.7337],
  'Perambalur':      [11.2337, 78.8733],
  'Pudukkottai':     [10.3833, 78.8001],
  'Ramanathapuram':  [9.3762,  78.8309],
  'Ranipet':         [12.9224, 79.3330],
  'Salem':           [11.6643, 78.1460],
  'Sivaganga':       [9.8477,  78.4800],
  'Tenkasi':         [8.9590,  77.3152],
  'Thanjavur':       [10.7870, 79.1378],
  'Theni':           [10.0104, 77.4770],
  'Thoothukudi':     [8.7642,  78.1348],
  'Tiruchirappalli': [10.7905, 78.7047],
  'Tirunelveli':     [8.7139,  77.7567],
  'Tirupathur':      [12.4958, 78.5732],
  'Tiruppur':        [11.1085, 77.3411],
  'Tiruvallur':      [13.1433, 79.9077],
  'Tiruvannamalai':  [12.2253, 79.0747],
  'Tiruvarur':       [10.7728, 79.6371],
  'Vellore':         [12.9165, 79.1325],
  'Viluppuram':      [11.9401, 79.4861],
  'Virudhunagar':    [9.5851,  77.9624],
}

def get_district_coords(name: str):
    return TN_DISTRICTS.get(name, TN_DISTRICTS['Chennai'])

def generate_route_waypoints(src, dest):
    points = [src]
    steps = 6
    for i in range(1, steps + 1):
        t = i / (steps + 1)
        lat = src[0] + (dest[0] - src[0]) * t + math.sin(t * math.pi) * 0.15
        lng = src[1] + (dest[1] - src[1]) * t + math.cos(t * math.pi * 0.7) * 0.08
        points.append([lat, lng])
    points.append(dest)
    return points
