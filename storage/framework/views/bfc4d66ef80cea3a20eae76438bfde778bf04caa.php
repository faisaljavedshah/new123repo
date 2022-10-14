<!-- Left side column. contains the logo and sidebar -->

<style>

</style>

<aside class="main-sidebar">
    <!-- sidebar: style can be found in sidebar.less -->
    <section class="sidebar">
        <!-- Sidebar user panel (optional) -->
        <!--
      <div class="user-panel">
        <div class="pull-left image">
          <img src="<?php echo e(asset('dist/img/user2-160x160.jpg')); ?>" class="img-circle" alt="User Image">
        </div>
        <div class="pull-left info">
          <p>Alexander Pierce</p>
          <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
        </div>
      </div>
      -->
        <!-- search form (Optional) -->
        <!--
      <form action="#" method="get" class="sidebar-form">
        <div class="input-group">
          <input type="text" name="q" class="form-control" placeholder="Search...">
              <span class="input-group-btn">
                <button type="submit" name="search" id="search-btn" class="btn btn-flat"><i class="fa fa-search"></i>
                </button>
              </span>
        </div>
      </form>
      -->
        <!-- /.search form -->
        <!-- Sidebar Menu -->
        <ul class="sidebar-menu">
            <!--
        <li class="header">HEADER</li>
        <li class="active"><a href="#"><i class="fa fa-link"></i> <span>Link</span></a></li>
        <li><a href="#"><i class="fa fa-link"></i> <span>Another Link</span></a></li>
        <li class="treeview">
          <a href="#"><i class="fa fa-link"></i> <span>Multilevel</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="#">Link in level 2</a></li>
            <li><a href="#">Link in level 2</a></li>
          </ul>
        </li>
        -->
            <?php $__currentLoopData = $menu; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?> <?php if(isset($item['children'])): ?>
            <li class="treeview">
                <a href="#"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span>
                <span class="pull-right-container">
                  <i class="fa fa-angle-down pull-left"></i>
                </span>
              </a>
                <ul class="treeview-menu">
                    <?php $__currentLoopData = $item['children']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $child): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <li><a class="navlink" href="<?php echo e($child['app_page']); ?>"><i class="<?php echo e($child['icon']); ?>"></i> <?php echo e($child['name']); ?></a></li>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </ul>
            </li>
            <?php else: ?>
              <?php if(isset($item['admin'])): ?>
                <?php if((isset($user->admin) && $user->admin == 1) || Session::has('origUserId')): ?>
                  <?php if(Session::has('origUserId') && $item['name'] == 'Admin'): ?>
                    <li><a class="navlink" href="/logout"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span></a></li>
                  <?php else: ?>
                    <li><a class="navlink" href="<?php echo e($item['app_page']); ?>"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span></a></li>
                  <?php endif; ?>
                <?php endif; ?>
              <?php else: ?>
                <?php if($item['name'] == 'Saved Searches'): ?>
                <li class="nav-item savedsearch_dropdown" id="saved_searches">
    
    <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span>
                <span class="pull-right-container load">
                  <i class="fa fa-angle-left pull-right arrow"></i>
                </span>
              </a>
    <ul class="dropdown-menu saved_searches" style="
    top: -70px;
    background-color: #eeeeee;
    left: 100%;
    border-color: #999999d9;
    max-height:400px;
    width:285px;
    overflow-y:scroll;
    visibility:hidden;
    "
    >
	 
		 
	  </li>
	  
    </ul>
</li>

                <?php elseif($item['name'] == 'Keyword Lists'): ?>

                <li class="nav-item dropdown2" id="keyword_lists">
    
    <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span>
                <span class="pull-right-container load2">
                  <i class="fa fa-angle-left pull-right arrow2"></i>
                </span>
              </a>
    <ul class="dropdown-menu keyword_lists" style="
    top: -70px;
    background-color: #eeeeee;
    left: 100%;
    border-color: #999999d9;
    max-height:400px;
    width:285px;
    overflow-y:scroll;
    visibility:hidden;
    "
    >
	 
		 
	  </li>
	  
    </ul>
</li>


                <?php else: ?>
                <li><a class="navlink" href="<?php echo e($item['app_page']); ?>"><i class="<?php echo e($item['icon']); ?>"></i> <span><?php echo e($item['name']); ?></span></a></li>
              <?php endif; ?>
              <?php endif; ?>
            <?php endif; ?> <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </ul>
        <input type="hidden" id="checking" value="0">
        <input type="hidden" id="arrow" value="2">
        <input type="hidden" id="checking2" value="0">
        <input type="hidden" id="arrow2" value="2">
        <!-- /.sidebar-menu -->
    </section>
    <!-- /.sidebar -->
</aside>
<style>
/* Tooltip container */
/* For Tooltip */

.tooltip-inner {
  background-color: #008fbd !important;
  color: #fff;
}

.tooltip.bottom .tooltip-arrow {
  border-bottom-color: #008fbd;
}
</style>

<?php /**PATH /home/sanaullah/Desktop/Senarios/Code/ConvirzaaAI/resources/views/includes/app/sidebar.blade.php ENDPATH**/ ?>