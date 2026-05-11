<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Apex Hotel and Resorts')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Mohave:wght@400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/apex-home.css', 'resources/js/apex-home.js'])
</head>
<body>
    @include('partials.navbar')

    <main class="page-shell">
        @yield('content')
    </main>

    @include('partials.footer')
</body>
</html>