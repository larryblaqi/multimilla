<!-- resources/views/account-reference.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
        }
        .reference {
            font-size: 24px;
            text-align: center;
            color: #e11d48;
            margin: 20px 0;
            padding: 10px;
            background-color: #fff;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Your Account Reference</h2>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>You've requested your account reference for password reset. Here it is:</p>
            
            <div class="reference">
                <?php echo e($accountReference); ?>

            </div>
            
            <p>Please use this reference to complete your password reset process. If you didn't request this, please ignore this email.</p>
            
            <p>For security reasons, this reference will only work with the email address associated with your account.</p>
            
            <p>Best regards,<br>MultiMilla</p>
        </div>
    </div>
</body>
</html><?php /**PATH /home/multsujh/lsapp/resources/views/verification.blade.php ENDPATH**/ ?>