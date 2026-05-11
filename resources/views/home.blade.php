@extends('layouts.apex')

@section('title', 'Apex Hotel and Resorts')

@php
    $heroSlides = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1920',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920',
    ];

    $heroTitle = "CHECK IN TO THE\nTIME OF YOUR LIFE";
    $heroPhone = '+923001234567';
    $heroWhatsapp = '923001234567';

    $bookingLocations = [
        ['label' => 'Islamabad', 'value' => 'islamabad'],
        ['label' => 'Murree', 'value' => 'murree'],
        ['label' => 'Naran Valley', 'value' => 'naran-valley'],
        ['label' => 'Bata Kundi', 'value' => 'bata-kundi'],
        ['label' => 'Lahore', 'value' => 'lahore'],
    ];

    $travel = [
        'title' => "TRAVEL LIKE\nNEVER BEFORE",
        'description' => "At Roomy Hotels, we believe hotels should be more than just a place to rest your head at night. We are passionate about creating experiences that reimagine hospitality, the authentic that values experience as absolute.",
        'buttonText' => 'TRY THE APP',
        'image' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    ];

    $locations = [
        ['name' => 'NORTHRIDGE BY APEX', 'location' => 'Batakundi, Naran Valley', 'image' => 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
        ['name' => 'APEX SIGNATURE HOTEL', 'location' => 'Islamabad Capital Territory', 'image' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        ['name' => 'WALNUT HEIGHTS BY APEX', 'location' => 'Kalam Valley, Khyber Pakhtunkhwa', 'image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
        ['name' => 'THE ROYER BY APEX', 'location' => 'Phander Valley', 'image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'],
        ['name' => 'THE APEX LODGE', 'location' => 'Murree, Punjab', 'image' => 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'],
        ['name' => 'ZHULE BY APEX', 'location' => 'Skardu', 'image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
        ['name' => 'APEX MOUNTAIN TOP RESORT', 'location' => 'Batakundi, Naran Valley', 'image' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
        ['name' => 'APEX YURTS GULMIT', 'location' => 'Gulmit, Hunza Valley', 'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    ];

    $locationSlides = array_chunk($locations, 8);
    $locationSizePattern = ['small', 'tall', 'medium', 'medium', 'medium', 'medium', 'wide', 'medium'];
    $firstLocationSlide = $locationSlides[0] ?? [];

    $diningItems = [
        ['id' => 1, 'name' => 'SKY LIGHT', 'description' => 'ROOMY SIGNATURE HOTEL, ISLAMABAD', 'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
        ['id' => 2, 'name' => 'THE ROOMY CAFE', 'description' => 'THE ROOMY LODGE, MURREE', 'image' => 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'],
        ['id' => 3, 'name' => 'BURGERVILLE BY ROOMY', 'description' => 'BATAKUNDI, NARAN VALLEY', 'image' => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800'],
    ];

    $offersBanner = [
        'title' => "See the\noffers & deals",
        'description' => 'Get exclusive offers on stays & deals to make new memories with us',
        'buttonText' => 'Premium Deal',
    ];

    $appSection = [
        'title' => 'FAST CHECK IN APP',
        'description' => "A Three-Step Feature For A Contactless And Hassle-Free Check-In Process.\nDownload Our App & Book A Room Now!",
    ];

    $contact = [
        'phone' => '+92-3-111-444-100',
        'email' => 'reservations@roomy.pk',
        'formTitle' => "WE'RE HERE TO HELP YOU",
    ];
@endphp

@section('content')
    <div class="home roomy-blade-home">
        <div class="sticky-booking-bar" data-sticky-booking hidden>
            <div class="sticky-booking-content">
                <div class="sticky-booking-field">
                    <label>Location</label>
                    <span>Where Are You Going?</span>
                </div>
                <div class="sticky-booking-field">
                    <label>Check In / Out</label>
                    <span>Add Dates</span>
                </div>
                <div class="sticky-booking-field">
                    <label>No. Of Rooms</label>
                    <span>Add Rooms</span>
                </div>
                <button type="button" class="sticky-book-btn">BOOK NOW</button>
            </div>
        </div>

        <section class="hero" data-hero data-slides='@json($heroSlides)' style="background-image: url('{{ $heroSlides[0] }}'); background-size: cover; background-position: center;">
            <div class="hero-container">
                <div class="hero-left">
                    <h1>
                        @foreach (explode("\n", $heroTitle) as $line)
                            {{ $line }}@if (! $loop->last)<br>@endif
                        @endforeach
                    </h1>
                </div>

                <div class="booking-widget card" data-booking-widget>
                    <form action="{{ url('/listings') }}" method="get" style="width: 100%;">
                        <div class="booking-field card-field" data-booking-field="location">
                            <label>Location</label>
                            <div class="card-value" data-location-display>{{ $bookingLocations[0]['label'] }}</div>
                            <select name="destination" data-location-input hidden>
                                @foreach ($bookingLocations as $location)
                                    <option value="{{ $location['value'] }}">{{ $location['label'] }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="booking-field card-field" data-booking-field="dates">
                            <label>Check In / Out</label>
                            <div class="card-value" data-dates-display></div>
                            <div class="date-row" data-dates-input hidden>
                                <input type="date" name="checkIn" data-check-in>
                                <span class="date-sep">—</span>
                                <input type="date" name="checkOut" data-check-out>
                            </div>
                        </div>

                        <div class="booking-field card-field rooms-field" data-booking-field="rooms">
                            <label>No. Of Rooms</label>
                            <div class="card-value" data-rooms-display>1 Room</div>
                            <div class="rooms-counter" data-rooms-input hidden>
                                <button type="button" class="rooms-btn" data-rooms-minus>−</button>
                                <div class="rooms-value" data-rooms-value>1</div>
                                <button type="button" class="rooms-btn" data-rooms-plus>+</button>
                                <input type="hidden" name="rooms" value="1" data-rooms-hidden>
                            </div>
                        </div>

                        <div style="margin-top: 0.5rem;">
                            <button type="submit" class="btn-check-availability">
                                <span>CHECK AVAILABILITY</span>
                                <span class="search-icon">🔍</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="carousel-nav">
                <div class="carousel-dots">
                    @foreach ($heroSlides as $index => $slide)
                        <button type="button" class="carousel-dot{{ $index === 0 ? ' active' : '' }}" data-slide-index="{{ $index }}" aria-label="Go to slide {{ $index + 1 }}">{{ $index + 1 }}</button>
                    @endforeach
                </div>
                <div class="carousel-progress">
                    @foreach ($heroSlides as $index => $slide)
                        <div class="progress-segment{{ $index === 0 ? ' active' : '' }}"></div>
                    @endforeach
                </div>
            </div>

            <button type="button" class="scroll-down" data-scroll-next-section></button>

            <div class="floating-actions">
                <a href="tel:{{ $heroPhone }}" class="floating-btn phone-btn" aria-label="Call now">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M6.62 10.79a15.54 15.54 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.32.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.99a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.27.19 2.47.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2Z" fill="currentColor" />
                    </svg>
                </a>
                <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $heroWhatsapp) }}" class="floating-btn whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.52 0 .2 5.31.2 11.86c0 2.09.55 4.14 1.58 5.95L0 24l6.39-1.67a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.87-5.31 11.87-11.86 0-3.17-1.24-6.14-3.43-8.44ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.83 9.83 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.89-9.87 2.64 0 5.12 1.03 6.99 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.19.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.48a8.93 8.93 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.43s1.05 2.82 1.2 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.25.47 1.68.6.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor" />
                    </svg>
                </a>
            </div>
        </section>

        <section class="travel-section">
            <div class="container-custom">
                <div class="travel-content">
                    <div class="travel-image">
                        <img src="{{ $travel['image'] }}" alt="Travel">
                    </div>
                    <div class="travel-text">
                        <h2>
                            @foreach (explode("\n", $travel['title']) as $line)
                                {{ $line }}@if (! $loop->last)<br>@endif
                            @endforeach
                        </h2>
                        <p>{{ $travel['description'] }}</p>
                        <button type="button" class="btn-cta">{{ $travel['buttonText'] }}</button>
                    </div>
                </div>
            </div>
        </section>

        <section class="locations-section" data-location-gallery data-slides='@json($locationSlides)'>
            <div class="container-custom">
                <div class="locations-header">
                    <div class="locations-title-area">
                        <h2 class="section-title">APEX HOTEL LOCATIONS</h2>
                        <p class="section-subtitle">Unlock new memories with us</p>
                    </div>
                    <div class="locations-nav">
                        <span class="view-more-text">VIEW MORE</span>
                        <div class="nav-arrows">
                            <button type="button" class="nav-arrow prev" data-location-prev aria-label="Previous">←</button>
                            <button type="button" class="nav-arrow next" data-location-next aria-label="Next">→</button>
                        </div>
                    </div>
                </div>
                <div class="hotels-grid" data-location-grid>
                    @foreach ($firstLocationSlide as $index => $hotel)
                        <div class="hotel-card {{ $locationSizePattern[$index % count($locationSizePattern)] }}">
                            <div class="hotel-image" style="background-image: url('{{ $hotel['image'] }}')">
                                <div class="hotel-info">
                                    <h3>{{ $hotel['name'] }}</h3>
                                    <p>{{ $hotel['location'] }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>

        <section class="dinein-section">
            <div class="container-custom">
                <div class="dinein-header">
                    <div class="dinein-title-area">
                        <h2 class="section-title">DINE-IN</h2>
                        <p class="section-subtitle">Guess what? We have cafes and restaurants too</p>
                    </div>
                </div>

                <div class="dinein-grid" data-dine-grid>
                    <div class="dinein-track" data-dine-track>
                        @foreach ($diningItems as $item)
                            <div class="dine-card">
                                <div class="dine-image" style="background-image: url('{{ $item['image'] }}')">
                                    <div class="dine-info">
                                        <h3>{{ $item['name'] }}</h3>
                                        <p>{{ $item['description'] }}</p>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <button type="button" class="dinein-arrow prev" data-dine-prev aria-label="Previous">←</button>
                    <button type="button" class="dinein-arrow next" data-dine-next aria-label="Next">→</button>
                </div>
            </div>
        </section>

        <section class="offers-banner">
            <div class="offers-content">
                <div class="offers-text">
                    <h3>{{ explode("\n", $offersBanner['title'])[0] }}<br><span class="highlight">{{ explode("\n", $offersBanner['title'])[1] ?? '' }}</span></h3>
                    <p>{{ $offersBanner['description'] }}</p>
                </div>
                <button type="button" class="btn-premium">{{ $offersBanner['buttonText'] }}</button>
            </div>
        </section>

        <section class="app-section fast-checkin-section">
            <div class="fast-checkin-content">
                <div class="fast-checkin-images">
                    <img src="{{ asset('app-section/phone1.png') }}" alt="Phone Mockup" class="phone-img-single">
                </div>
                <div class="fast-checkin-text">
                    <h2>{{ $appSection['title'] }}</h2>
                    <p class="fast-checkin-desc">
                        @foreach (explode("\n", $appSection['description']) as $line)
                            {{ $line }}@if (! $loop->last)<br>@endif
                        @endforeach
                    </p>
                    <div class="fast-checkin-badges">
                        <a href="#google" class="store-badge">
                            <img src="{{ asset('app-section/google-play.png') }}" alt="Google Play">
                        </a>
                        <a href="#apple" class="store-badge">
                            <img src="{{ asset('app-section/app-store.png') }}" alt="App Store">
                        </a>
                    </div>
                    <img src="{{ asset('app-section/arrow.png') }}" alt="Arrow" class="fast-checkin-arrow">
                </div>
            </div>
        </section>

        <section class="contact-section">
            <div class="contact-section-bg-bar"></div>
            <div class="contact-columns contact-section-inner">
                <div class="contact-info-col">
                    <h2 class="contact-info-title">CONTACT US</h2>
                    <div class="contact-info-details">
                        <div class="contact-info-phone">Phone: <a href="tel:{{ preg_replace('/[^+0-9]/', '', $contact['phone']) }}">{{ $contact['phone'] }}</a></div>
                        <div class="contact-info-email">Email: <a href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a></div>
                    </div>
                    <div class="contact-blue-bar"></div>
                </div>

                <div class="contact-form-card contact-form-card-large">
                    <form class="contact-form" data-contact-form>
                        <h3 class="contact-form-heading">{{ $contact['formTitle'] }}</h3>
                        <div class="form-group">
                            <label>Name <span class="required">*</span></label>
                            <input type="text" name="name" placeholder="Name" class="contact-input" required>
                        </div>
                        <div class="form-row form-row-2col">
                            <div class="form-group">
                                <label>Email <span class="required">*</span></label>
                                <input type="email" name="email" placeholder="Email" class="contact-input" required>
                            </div>
                            <div class="form-group">
                                <label>Phone <span class="required">*</span></label>
                                <input type="tel" name="phone" placeholder="+92 3xx-xxxxxxx" class="contact-input" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Subject <span class="required">*</span></label>
                            <input type="text" name="subject" placeholder="Subject" class="contact-input" required>
                        </div>
                        <div class="form-group">
                            <label>Message <span class="required">*</span></label>
                            <textarea name="message" placeholder="Message" rows="4" class="contact-input" required></textarea>
                        </div>
                        <div class="status-message" data-contact-status hidden></div>
                        <button type="submit" class="btn-submit btn-blue">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    </div>
@endsection