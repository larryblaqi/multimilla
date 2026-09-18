

<?php $__env->startSection('title', 'Wallet Funded Successfully'); ?>

<?php $__env->startSection('content'); ?>
    <div class="greeting">Wallet Funded! 💰</div>
    
    <div class="content">
        <p>Hello <?php echo e($customer->first_name ?? $customer->full_name); ?>,</p>
        
        <p>Your wallet has been credited successfully.</p>
    </div>
    
    <div class="info-box success">
        <div class="info-box-title">Funding Details</div>
        <div class="info-row">
            <span class="info-label">Amount Credited:</span>
            <span class="info-value highlight">₦<?php echo e(number_format($amount, 2)); ?></span>
        </div>
        <?php if(isset($transaction->transaction_id)): ?>
        <div class="info-row">
            <span class="info-label">Reference:</span>
            <span class="info-value"><?php echo e($transaction->transaction_id); ?></span>
        </div>
        <?php endif; ?>
        <div class="info-row">
            <span class="info-label">New Balance:</span>
            <span class="info-value highlight">₦<?php echo e(number_format($customer->wallet_balance, 2)); ?></span>
        </div>
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value"><?php echo e(now()->format('M d, Y H:i A')); ?></span>
        </div>
    </div>
    
    <div class="content">
        <p><strong>What's next?</strong></p>
        <p>You can now use your wallet balance for:</p>
        <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Buying airtime and data</li>
            <li>Paying for TV subscriptions and electricity</li>
            <li>Creating virtual or physical cards</li>
            <li>Investing in packages</li>
            <li>Applying for loans</li>
            <li>Withdrawing to your bank account</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
        <a href="<?php echo e(config('app.customer_url') ?? config('app.url')); ?>/wallet" class="button">
            View Wallet
        </a>
    </div>
<?php $__env->stopSection(); ?>


<?php echo $__env->make('emails.layout', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\xampp\htdocs\multimilla\lsapp\resources\views/emails/wallet-funded.blade.php ENDPATH**/ ?>