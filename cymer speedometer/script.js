document.addEventListener('DOMContentLoaded', function() {
    const needle = document.querySelector('.needle');
    const speedDisplay = document.querySelector('.speed-display');
    const avgSpeedDisplay = document.getElementById('avg-speed');
    const maxSpeedDisplay = document.getElementById('max-speed');
    const odometerDisplay = document.getElementById('odometer');

    let speedSum = 0;
    let speedCount = 0;
    let maxSpeed = 0;
    let totalDistance = parseFloat(localStorage.getItem('totalDistance')) || 0;
    let lastPosition = null;

    // Update the odometer display with the stored total distance
    odometerDisplay.textContent = totalDistance.toFixed(2);

    function updateSpeed(speed) {
        const maxSpeedometerSpeed = 300; // Maximum speed for the speedometer
        const rotation = (speed / maxSpeedometerSpeed) * 270 - 45; // Convert speed to degrees (0 to 270) and adjust for initial angle
        needle.style.transform = `rotate(${rotation}deg)`;
        speedDisplay.textContent = `${speed.toFixed(1)} km/h`;

        // Update average speed
        speedSum += speed;
        speedCount += 1;
        const avgSpeed = speedSum / speedCount;
        avgSpeedDisplay.textContent = avgSpeed.toFixed(1);

        // Update max speed
        if (speed > maxSpeed) {
            maxSpeed = speed;
            maxSpeedDisplay.textContent = maxSpeed.toFixed(1);
        }
    }

    function updateOdometer(position) {
        if (lastPosition) {
            const distance = calculateDistance(lastPosition, position);
            totalDistance += distance;
            localStorage.setItem('totalDistance', totalDistance.toFixed(2));
            odometerDisplay.textContent = totalDistance.toFixed(2);
        }
        lastPosition = position;
    }

    function calculateDistance(pos1, pos2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
        const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos1.latitude * (Math.PI / 180)) * Math.cos(pos2.latitude * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    function getSpeed() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                function(position) {
                    const speed = position.coords.speed * 3.6; // Convert m/s to km/h
                    updateSpeed(speed);
                    updateOdometer(position.coords);
                },
                function(error) {
                    console.error('Error getting location:', error);
                    speedDisplay.textContent = 'Error';
                },
                {
                    enableHighAccuracy: true
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            speedDisplay.textContent = 'No GPS';
        }
    }

    getSpeed();
});
