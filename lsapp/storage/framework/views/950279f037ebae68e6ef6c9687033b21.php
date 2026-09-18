<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $__env->yieldContent('title', 'Multimilla'); ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .email-header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: 1px;
        }
        
        .tagline {
            color: #ffffff;
            font-size: 14px;
            margin-top: 5px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 20px;
        }
        
        .content {
            font-size: 16px;
            color: #555555;
            line-height: 1.8;
        }
        
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #4CAF50;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        
        .button:hover {
            background-color: #45a049;
        }
        
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .info-box-title {
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #666666;
        }
        
        .info-value {
            color: #333333;
            font-weight: 600;
        }
        
        .highlight {
            color: #4CAF50;
            font-weight: 700;
        }
        
        .warning {
            background-color: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        
        .success {
            background-color: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        
        .danger {
            background-color: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px 20px;
            text-align: center;
            color: #666666;
            font-size: 14px;
        }
        
        .footer-links {
            margin: 15px 0;
        }
        
        .footer-link {
            color: #4CAF50;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #666666;
            text-decoration: none;
        }
        
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 30px 0;
        }
        
        .small-text {
            font-size: 12px;
            color: #999999;
            margin-top: 20px;
            line-height: 1.5;
        }
        
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .content {
                font-size: 14px;
            }
            
            .info-row {
                flex-direction: column;
            }
            
            .info-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">MULTIMILLA</div>
            <div class="tagline">Your Digital Banking Partner</div>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <?php echo $__env->yieldContent('content'); ?>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-links">
                <a href="<?php echo e(config('app.url')); ?>" class="footer-link">Home</a>
                <a href="<?php echo e(config('app.url')); ?>/about" class="footer-link">About Us</a>
                <a href="<?php echo e(config('app.url')); ?>/contact" class="footer-link">Contact</a>
                <a href="<?php echo e(config('app.url')); ?>/faq" class="footer-link">FAQ</a>
            </div>
            
            <div class="divider"></div>
            
            <p>
                Need help? Contact our support team at<br>
                <a href="mailto:support@multimilla.com" class="footer-link">support@multimilla.com</a><br>
                or call us at <strong>+234 800 MULTIMILLA</strong>
            </p>
            
            <div class="small-text">
                <p>
                    This email was sent to you because you have an account with Multimilla.<br>
                    If you did not request this email, please ignore it or contact support.
                </p>
                <p style="margin-top: 10px;">
                    © <?php echo e(date('Y')); ?> Multimilla. All rights reserved.<br>
                    Lagos, Nigeria
                </p>
            </div>
        </div>
    </div>
</body>
</html>

<?php /**PATH C:\xampp\htdocs\multimilla\lsapp\resources\views/emails/layout.blade.php ENDPATH**/ ?>