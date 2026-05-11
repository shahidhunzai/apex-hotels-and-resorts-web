<nav class="navbar">
    <div class="nav-wrapper">
        <a href="{{ url('/') }}" class="logo">
            <div class="logo-icon"></div>
           
        </a>

        <div class="nav-links" data-nav-links>
            <a href="{{ url('/') }}">HOME</a>
            <a href="{{ url('/destinations') }}">DESTINATIONS</a>
            <a href="{{ url('/hotel-listing') }}">HOTELS</a>
            <a href="{{ url('/contact') }}">GETAWAYS</a>
        </div>

        <div class="nav-actions">
            <button type="button" class="btn-login"><span class="user-icon">👤</span> SIGN IN</button>
            <a href="{{ url('/contact') }}" class="btn-trip">PLAN YOUR TRIP / TOUR</a>
        </div>

        <button type="button" class="hamburger" data-nav-toggle aria-label="Toggle navigation" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</nav>