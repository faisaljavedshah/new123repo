<!-- Main Header -->
<header class="main-header">
    <!-- Logo -->
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <a href="/" class="logo">




        <!-- mini logo for sidebar mini 50x50 pixels -->
        <span class="logo-mini">Convirza</span>
        <!-- logo for regular state and mobile devices -->
        <span class="logo-lg"><img src="<?php echo e(secure_asset('/image/ababa-logo.png')); ?>" style="width: 150px"></span>
    </a>
    <!-- Header Navbar -->
    <nav class="navbar navbar-static-top" role="navigation">
        <!-- Sidebar toggle button-->
        <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
            <span class="sr-only">Toggle navigation</span>
        </a>
        <?php if($customer->freeTrial()): ?>
        <div class="navbar-header">
            <a href="#billing" class="btn btn-block btn-warning free-trial-button">Free Trial</a>
        </div>
        <?php endif; ?>
        <!-- Navbar Right Menu -->
        <div class="navbar-custom-menu">
            <ul class="nav navbar-nav">
                <!-- User Account Menu -->
                <li class="dropdown user user-menu">
                    <!-- Menu Toggle Button -->
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <!-- The user image in the navbar-->
                        <img src="<?php echo e($user->avatar); ?>" class="user-image" alt="User Image">
                        <!-- hidden-xs hides the username on small devices so only the image appears. -->
                        <span class="hidden-xs"><?php echo e($user->name); ?></span>
                    </a>
                    <ul class="dropdown-menu">
                        <!-- The user image in the menu -->
                        <li class="user-header">
                            <img src="<?php echo e($user->avatar); ?>" class="img-circle" alt="User Image">
                            <p>
                                <?php echo e($user->name); ?>

                                <!-- <small>Member since Nov. 2012</small> -->
                            </p>
                        </li>
                        <!-- Menu Body -->
                        <!--
                        <li class="user-body">
                            <div class="row">
                                <div class="col-xs-4 text-center">
                                    <a href="#">Followers</a>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <a href="#">Sales</a>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <a href="#">Friends</a>
                                </div>
                            </div>
                        </li>
                        -->
                        <!-- Menu Footer-->
                        <li class="user-footer">
                            <div class="pull-left">
                                <a href="#profile" class="btn btn-default btn-flat">Profile</a>
                            </div>
                            <div class="pull-right">
                                <!-- <a href="logout" class="btn btn-default btn-flat">Logout</a> -->
                                <a class="btn btn-default btn-flat" href="/logout"><i class="fa fa-sign-out"></i> <span>Logout</span></a>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
</header><?php /**PATH /home/sanaullah/Desktop/Senarios/Code/ConvirzaaAI/resources/views/includes/app/header.blade.php ENDPATH**/ ?>