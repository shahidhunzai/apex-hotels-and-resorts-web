<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #333;
        }

        .error-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 60px 40px;
            text-align: center;
            max-width: 600px;
            animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .error-code {
            font-size: 120px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            line-height: 1;
        }

        .error-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2d3e50;
        }

        .error-description {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .error-suggestions {
            text-align: left;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 40px;
            border-radius: 5px;
        }

        .error-suggestions h3 {
            font-size: 14px;
            color: #2d3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .error-suggestions ul {
            list-style: none;
            padding: 0;
        }

        .error-suggestions li {
            font-size: 14px;
            color: #555;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }

        .error-suggestions li:before {
            content: '→';
            position: absolute;
            left: 0;
            color: #667eea;
        }

        .error-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 30px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #f0f0f0;
            color: #2d3e50;
        }

        .btn-secondary:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }

        .error-illustration {
            width: 100px;
            height: 100px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
        }

        @media (max-width: 600px) {
            .error-container {
                padding: 40px 20px;
            }

            .error-code {
                font-size: 80px;
            }

            .error-title {
                font-size: 24px;
            }

            .error-buttons {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-illustration">
            ⚠️
        </div>
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
            Sorry, the page you are looking for doesn't exist. It might have been removed, moved, or the URL might be incorrect.
        </p>

        <div class="error-suggestions">
            <h3>What you can do:</h3>
            <ul>
                <li>Check the URL and try again</li>
                <li>Return to the homepage</li>
                <li>Browse our destinations</li>
                <li>Contact our support team for help</li>
            </ul>
        </div>

        <div class="error-buttons">
            <a href="/" class="btn btn-primary">Go to Homepage</a>
            <a href="javascript:history.back()" class="btn btn-secondary">Go Back</a>
        </div>
    </div>
</body>
</html>
