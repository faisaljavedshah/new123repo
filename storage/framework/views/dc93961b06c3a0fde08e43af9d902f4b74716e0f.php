<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Convirza | Log in</title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link rel="stylesheet" href="<?php echo e(mix('css/plugins.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(mix('css/app.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(mix('css/skins/skin-blue.css')); ?>">
</head>

<body class="hold-transition login-page">
    <div class="login-box">
        <div class="login-logo">
            <a href="../../index2.html"><b>Convirza</b></a>
        </div>
        <!-- /.login-logo -->
        <div class="login-box-body">
            <p class="login-box-msg">Sign in to start your session</p>
            <?php echo Form::open(['url' => 'login', 'method' => 'post']); ?>

            <div class="alert-section"></div>
            <div class="form-group has-feedback">
                <input name="email" type="email" class="form-control" placeholder="Email">
                <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
                <p class="help-block hidden" for="email"></p>
            </div>
            <div class="form-group has-feedback">
                <input name="password" type="password" class="form-control" placeholder="Password">
                <span class="glyphicon glyphicon-lock form-control-feedback"></span>
                <p class="help-block hidden" for="password"></p>
            </div>
            <div class="form-group has-feedback">
                <div class="col-xs-8">
                    <div class="checkbox icheck">
                        <label>
                            <input style="margin-left:-15px;" name="remember_me" type="checkbox"> Remember Me
                        </label>
                    </div>
                </div>
                <!-- /.col -->
                <div class="col-xs-4">
                    <button name="submit" type="submit" class="btn btn-primary btn-block btn-flat">
                        <i class="fa fa-refresh fa-spin fa-1x hasSpin"></i>
                        Login
                    </button>
                </div>
                <!-- /.col -->
            </div>
            <?php echo e(Form::hidden('location')); ?>

            <?php echo e(Form::close()); ?>

            <!--
            <div class="social-auth-links text-center">
                <p>- OR -</p>
                <a href="auth/google" class="btn btn-block btn-social btn-google btn-flat"><i class="fa fa-google-plus"></i> Login using Google+</a>
            </div>
            -->
            <!-- /.social-auth-links -->
            <br>
            <br>
            <a href="/forgot" class="text-center">I forgot my password</a>
            <br>
            <a href="signup" class="text-center">Register a new membership</a>
        </div>
        <!-- /.login-box-body -->
    </div>
    <!-- /.login-box -->
    <script src="<?php echo e(mix('js/plugins.js')); ?>"></script>
    <script src="<?php echo e(mix('js/signup.js')); ?>"></script>
</body>

</html><?php /**PATH /home/sanaullah/Desktop/Senarios/Code/ConvirzaaAI/resources/views/login.blade.php ENDPATH**/ ?>