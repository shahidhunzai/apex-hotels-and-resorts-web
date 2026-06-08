@php
    $customerReviews = [
        [
            'name' => 'Umair Jaswal',
            'avatar' => 'https://randomuser.me/api/portraits/men/32.jpg',
            'review' => "Can't wait to revisit this beautiful lodge in Batakundi upper Naran. Thank you for your hospitality.",
        ],
        [
            'name' => 'Humna Raza',
            'avatar' => 'https://randomuser.me/api/portraits/women/44.jpg',
            'review' => 'Surrounding Roomy Mountain Top Resort are these beautiful view spots & there is a river flowing too; I wanted to stop and take a picture at every spot but also did not want to be that annoying person.',
        ],
        [
            'name' => 'Eva Zu Beck',
            'avatar' => 'https://randomuser.me/api/portraits/women/68.jpg',
            'review' => 'Slept here btw. Actually one of the few modern, pretty and affordable hotels in Islamabad.',
        ],
    ];

    $journalEntries = [
        [
            'title' => 'Informative, Upbeat And Aspirational!',
            'avatar' => 'https://randomuser.me/api/portraits/men/12.jpg',
            'date' => '15 February',
        ],
        [
            'title' => 'Roomy Has Introduced A 3 Step Fast Check-In Feature',
            'avatar' => 'https://randomuser.me/api/portraits/men/22.jpg',
            'date' => '1 Month Ago',
        ],
        [
            'title' => 'Roomy Aims To Help The Local Economy Thrive!',
            'avatar' => 'https://randomuser.me/api/portraits/men/42.jpg',
            'date' => '3 Months Ago',
        ],
    ];

    // Default partner logos - will be replaced by dynamic data from CMS
    $partnerLogos = [
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/unilever_desktop.png', 'alt' => 'Unilever'],
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/hum_desktop.png', 'alt' => 'HUM'],
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/nando_desktop.png', 'alt' => "Nando's"],
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/kfc_desktop.png', 'alt' => 'KFC'],
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/giz_desktop.png', 'alt' => 'GIZ'],
        ['src' => 'https://assets.roomy.pk/images/locations_5/homepage/abacus_desktop.png', 'alt' => 'Abacus'],
    ];

    $paymentLogos = [
        ['src' => 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png', 'alt' => 'Mastercard'],
        ['src' => 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', 'alt' => 'Visa'],
        ['src' => 'https://seeklogo.com/images/H/hbl-pay-logo-6B1B2B7B2A-seeklogo.com.png', 'alt' => 'HBL Pay'],
    ];

    $socialLinks = [
        ['key' => 'twitter', 'href' => 'https://twitter.com', 'label' => 'X / Twitter', 'color' => '#111111'],
        ['key' => 'whatsapp', 'href' => 'https://wa.me/923001234567', 'label' => 'WhatsApp', 'color' => '#25d366'],
        ['key' => 'instagram', 'href' => 'https://instagram.com', 'label' => 'Instagram', 'color' => '#e1306c'],
        ['key' => 'facebook', 'href' => 'https://facebook.com', 'label' => 'Facebook', 'color' => '#1877f3'],
        ['key' => 'linkedin', 'href' => 'https://linkedin.com', 'label' => 'LinkedIn', 'color' => '#0077b5'],
    ];

    $initialReview = $customerReviews[0];
@endphp

<footer class="footer-v2" data-footer-reviews='@json($customerReviews)'>
    <div class="footer-main">
        <div class="footer-col reviews-col">
            <h3>CUSTOMER REVIEWS</h3>
            <div class="reviews-list">
                <div class="review-item">
                    <img class="review-avatar" data-review-avatar src="{{ $initialReview['avatar'] }}" alt="{{ $initialReview['name'] }}">
                    <div>
                        <div class="reviewer-name" data-review-name>{{ $initialReview['name'] }}</div>
                        <div class="review-text" data-review-text>{{ $initialReview['review'] }}</div>
                    </div>
                </div>
            </div>
            <div class="reviews-dots">
                @foreach ($customerReviews as $index => $review)
                    <button type="button" class="dot{{ $index === 0 ? ' active' : '' }}" data-review-dot="{{ $index }}" aria-label="Show review {{ $index + 1 }}"></button>
                @endforeach
            </div>
        </div>

        <div class="footer-col menu-col">
            <h3>MENU</h3>
            <ul>
                <li>ABOUT US</li>
                <li>OUR LOCATIONS</li>
                <li>DINE IN</li>
                <li>PRIVACY POLICY</li>
                <li>TERMS & CONDITIONS</li>
                <li>CONTACT US</li>
            </ul>
        </div>

        <div class="footer-col journal-col">
            <h3>JOURNAL</h3>
            <div class="journal-list">
                @foreach ($journalEntries as $entry)
                    <div class="journal-item">
                        <img class="journal-avatar" src="{{ $entry['avatar'] }}" alt="{{ $entry['title'] }}">
                        <div>
                            <div class="journal-title">{{ $entry['title'] }}</div>
                            <div class="journal-date">{{ $entry['date'] }}</div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="footer-col host-col">
            <div class="footer-host-brand">
                <div class="footer-host-logo">
                    <svg width="46" height="46" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="48" height="48" rx="8" fill="#2d3e50" />
                        <text x="30" y="38" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff">Apex</text>
                    </svg>
                    <span class="footer-host-logo-text">Hotel & Resorts</span>
                </div>
            </div>
            <h3>WE ALSO HOST</h3>
            <div class="host-logos" id="partner-logos-container">
                @foreach ($partnerLogos as $logo)
                    <img class="host-logo" src="{{ $logo['src'] }}" alt="{{ $logo['alt'] }}">
                @endforeach
            </div>

            <div class="host-social-block">
                <span>FOLLOW US</span>
                <div class="footer-social-icons">
                    @foreach ($socialLinks as $social)
                        <a href="{{ $social['href'] }}" target="_blank" rel="noopener noreferrer" style="color: {{ $social['color'] }}" aria-label="{{ $social['label'] }}">
                            @if ($social['key'] === 'twitter')
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M18.901 2H22.58l-8.036 9.184L24 22h-7.406l-5.8-6.594L5.026 22H1.345l8.596-9.824L0 2h7.594l5.243 5.966L18.901 2Zm-1.298 17.786h2.045L6.483 4.098H4.29L17.603 19.786Z" fill="currentColor" />
                                </svg>
                            @elseif ($social['key'] === 'whatsapp')
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.52 0 .2 5.31.2 11.86c0 2.09.55 4.14 1.58 5.95L0 24l6.39-1.67a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.87-5.31 11.87-11.86 0-3.17-1.24-6.14-3.43-8.44ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.83 9.83 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.89-9.87 2.64 0 5.12 1.03 6.99 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.19.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.48a8.93 8.93 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.43s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.25.47 1.68.6.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor" />
                                </svg>
                            @elseif ($social['key'] === 'instagram')
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.97 1.35a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.15 5.15 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" fill="currentColor" />
                                </svg>
                            @elseif ($social['key'] === 'facebook')
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.6-1.56h1.71V4.14c-.83-.09-1.66-.14-2.5-.14-2.47 0-4.16 1.51-4.16 4.28v2.32H7.36v3.2h2.79V22h3.35Z" fill="currentColor" />
                                </svg>
                            @else
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M4.98 3.5A1.98 1.98 0 1 1 5 7.46a1.98 1.98 0 0 1-.02-3.96ZM3.5 8.75h3V20h-3V8.75Zm4.88 0h2.88v1.54h.04c.4-.76 1.39-1.56 2.87-1.56 3.07 0 3.63 2.02 3.63 4.65V20h-3v-5.88c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V20h-3V8.75Z" fill="currentColor" />
                                </svg>
                            @endif
                        </a>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <div class="footer-social-row">
        <div class="footer-payments">
            @foreach ($paymentLogos as $logo)
                <img class="payment-logo" src="{{ $logo['src'] }}" alt="{{ $logo['alt'] }}">
            @endforeach
        </div>
    </div>
</footer>

<script>
    // Fetch partner logos dynamically from CMS
    (function() {
        const container = document.getElementById('partner-logos-container');
        if (!container) return;

        // Determine the API URL
        const apiUrl = (() => {
            if (typeof window !== 'undefined' && window.location) {
                const baseUrl = window.location.origin;
                // Check if we're in development or production
                if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                    return 'http://localhost:5000/api/cms';
                }
            }
            // Default to the current origin
            return '/api/cms';
        })();

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch CMS data');
                return response.json();
            })
            .then(data => {
                if (data.partnerLogos && Array.isArray(data.partnerLogos) && data.partnerLogos.length > 0) {
                    // Clear existing logos
                    container.innerHTML = '';
                    
                    // Add new logos from CMS
                    data.partnerLogos.forEach(logo => {
                        const img = document.createElement('img');
                        img.className = 'host-logo';
                        img.src = logo.src || logo.image || '';
                        img.alt = logo.alt || logo.name || 'Partner Logo';
                        container.appendChild(img);
                    });
                }
            })
            .catch(error => {
                // Silently fail and keep default logos
                console.debug('Could not load dynamic partner logos, using defaults:', error);
            });
    })();
</script>