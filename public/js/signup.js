$(document).ready(function() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const screenOrientation = window.screen.orientation.type || 'Unknown';
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const deviceMemory = navigator.deviceMemory || 'Unknown';
    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
    const connection = navigator.connection || {};
    const connectionType = connection.effectiveType || 'Unknown';
    const downlink = connection.downlink || 'Unknown';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'Unknown';
    const referrer = document.referrer || 'Unknown';
    const cookiesEnabled = navigator.cookieEnabled;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const zoomLevel = Math.round((window.outerWidth / window.innerWidth) * 100) || 'Unknown';

    document.getElementById('screen_width').value = screenWidth;
    document.getElementById('screen_height').value = screenHeight;
    document.getElementById('screen_orientation').value = window.screen.orientation.type;
    document.getElementById('viewport_width').value = viewportWidth;
    document.getElementById('viewport_height').value = viewportHeight;
    document.getElementById('device_memory').value = deviceMemory;
    document.getElementById('cpu_cores').value = cpuCores;
    document.getElementById('connection_type').value = connectionType;
    document.getElementById('downlink').value = downlink;
    document.getElementById('time_zone').value = timeZone;
    document.getElementById('language').value = language;
    document.getElementById('referrer').value = referrer;
    document.getElementById('cookies_enabled').value = cookiesEnabled;
    document.getElementById('is_touch_device').value = isTouchDevice;
    document.getElementById('zoom_level').value = zoomLevel;
    document.getElementById('device_pixel_ratio').value = window.devicePixelRatio || 'Unknown';
    document.getElementById('prefers_color_scheme').value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.getElementById('prefers_reduced_data').value = window.matchMedia('(prefers-reduced-data: reduce)').matches ? 'true' : 'false';
    document.getElementById('prefers_reduced_motion').value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'true' : 'false';
    document.getElementById('prefers_high_contrast').value = window.matchMedia('(forced-colors: active)').matches ? 'true' : 'false';
    document.getElementById('prefers_contrast').value = window.matchMedia('(prefers-contrast: more)').matches ? 'high' : 'normal';
    


   
    navigator.getBattery().then(battery => {
        document.getElementById('battery_level').value = battery.level * 100 + '%';
        document.getElementById('battery_is_charging').value = battery.charging ? 'Charging' : 'Not charging';
    });

    navigator.storage.estimate().then(estimate => {
        const storageQuota = estimate.quota || 'Unknown';
        const storageUsage = estimate.usage || 'Unknown';
        document.getElementById('storage_quota_estimate').value = storageQuota;
        document.getElementById('storage_usage_estimate').value = storageUsage;
    });


    
    // Initialize hoverable popup for info icons
    $('.icon.info.circle.link').popup({
        hoverable: true
    });

    // Close message on click
    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });

    // Form validation rules
    var validationRules = {
        email: {
            identifier: 'email',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter your e-mail',
                },
                {
                    type: 'email',
                    prompt: 'Please enter a valid e-mail',
                }
            ]
        },
        password: {
            identifier: 'password',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Please enter a password',
                },
                {
                    type: 'minLength[8]',
                    prompt: 'Your password must be at least 8 characters',
                }
            ]
        }
    };

    // Initialize form validation
    $('.ui.form').form({
        fields: validationRules,
        inline: true,
        on: 'blur'
    });
});
