

<?php $__env->startSection('title', 'Loan Application Update'); ?>

<?php $__env->startSection('content'); ?>
    <div class="greeting">
        <?php if($loan->status === 'approved'): ?>
            Loan Approved! 🎉
        <?php elseif($loan->status === 'rejected'): ?>
            Loan Application Update
        <?php else: ?>
            Loan Application <?php echo e(ucfirst($loan->status)); ?>

        <?php endif; ?>
    </div>
    
    <div class="content">
        <p>Hello <?php echo e($customer->first_name ?? $customer->full_name); ?>,</p>
        
        <p>
            <?php if($loan->status === 'approved'): ?>
                Great news! Your loan application has been approved. The funds have been credited to your wallet.
            <?php elseif($loan->status === 'rejected'): ?>
                We regret to inform you that your loan application was not approved at this time.
            <?php elseif($loan->status === 'cleared'): ?>
                Your loan has been successfully cleared. Thank you for your prompt payment!
            <?php else: ?>
                Your loan application status has been updated to: <strong><?php echo e(ucfirst($loan->status)); ?></strong>
            <?php endif; ?>
        </p>
    </div>
    
    <div class="info-box <?php echo e($loan->status === 'approved' ? 'success' : ($loan->status === 'rejected' ? 'danger' : '')); ?>">
        <div class="info-box-title">Loan Details</div>
        <div class="info-row">
            <span class="info-label">Loan Product:</span>
            <span class="info-value"><?php echo e($loan->loanProduct->name ?? 'N/A'); ?></span>
        </div>
        <div class="info-row">
            <span class="info-label">Requested Amount:</span>
            <span class="info-value">₦<?php echo e(number_format($loan->requested_amount, 2)); ?></span>
        </div>
        <?php if($loan->status === 'approved' && $loan->approved_amount): ?>
        <div class="info-row">
            <span class="info-label">Approved Amount:</span>
            <span class="info-value highlight">₦<?php echo e(number_format($loan->approved_amount, 2)); ?></span>
        </div>
        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value"><?php echo e($loan->timeline_days); ?> days</span>
        </div>
        <div class="info-row">
            <span class="info-label">Due Date:</span>
            <span class="info-value"><?php echo e(\Carbon\Carbon::parse($loan->due_date)->format('M d, Y')); ?></span>
        </div>
        <?php endif; ?>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value"><?php echo e(ucfirst($loan->status)); ?></span>
        </div>
        <div class="info-row">
            <span class="info-label">Application Date:</span>
            <span class="info-value"><?php echo e($loan->created_at->format('M d, Y')); ?></span>
        </div>
    </div>
    
    <?php if($loan->status === 'approved' && $loan->approval_note): ?>
    <div class="content">
        <p><strong>Admin Note:</strong></p>
        <p><?php echo e($loan->approval_note); ?></p>
    </div>
    <?php endif; ?>
    
    <?php if($loan->status === 'rejected' && $loan->rejection_reason): ?>
    <div class="content">
        <p><strong>Reason for Rejection:</strong></p>
        <p><?php echo e($loan->rejection_reason); ?></p>
        <p style="margin-top: 10px;"><small>You may reapply after 30 days or contact support for more information.</small></p>
    </div>
    <?php endif; ?>
    
    <?php if($loan->status === 'approved'): ?>
    <div class="info-box warning">
        <p><strong>⚠️ Important Reminder:</strong></p>
        <p>Please ensure you repay your loan on or before the due date to avoid late fees and maintain a good credit score.</p>
    </div>
    <?php endif; ?>
    
    <div style="text-align: center; margin-top: 20px;">
        <a href="<?php echo e(config('app.customer_url') ?? config('app.url')); ?>/finance" class="button">
            View Loan Details
        </a>
    </div>
<?php $__env->stopSection(); ?>


<?php echo $__env->make('emails.layout', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\xampp\htdocs\multimilla\lsapp\resources\views/emails/loan-status.blade.php ENDPATH**/ ?>