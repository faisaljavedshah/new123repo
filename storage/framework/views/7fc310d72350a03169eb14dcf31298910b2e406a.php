<!-- Content Header (Page header) -->
<section class="content-header">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
        </ol>
    </nav>
    <h1>
        Dashboard
        <span class="info-box-text">Last Updated</span>
        <span class="info-box-text" id="all-updatetime"><i class="fa fa-refresh fa-spin fa-1x"></i></span>
    </h1>
</section>
<!-- Main content -->
<section class="content">
    <!-- Info boxes -->
    <div class="row">
        <div class="col-xs-12">
            <div class="row" style="margin-bottom: 10px;">
                <div class="col-xs-6">
                    <div id="report-range" class="pull-right"
                        style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                        <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>&nbsp;
                        <span></span> <b class="caret"></b>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-left: -5px; margin-right: -5px;">
                <div class="col-xs-6 col-md-3" style="padding: 0px; margin: 0px;">
                    <div class="info-box" style="margin-bottom: 1px;">
                        <span class="info-box-icon bg-aqua"><i class="fa fa-file-audio-o"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Recordings Uploaded</span>
                            <span class="info-box-number timeframe" id="recordingUpload">0</span>
                        </div>
                        <!-- /.info-box-content -->
                    </div>
                    <!-- /.info-box -->
                </div>
                <!-- /.col -->
                <div class="col-xs-6 col-md-3" style="padding: 0px; margin: 0px;">
                    <div class="info-box" style="margin-bottom: 1px;">
                        <span class="info-box-icon bg-red"><i class="fa fa-clock-o"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Recording Minutes</span>
                            <span class="info-box-number timeframe" id="recordingDuration">0</span>
                        </div>
                        <!-- /.info-box-content -->
                    </div>
                    <!-- /.info-box -->
                </div>
                <div class="col-xs-6 col-md-3" style="padding: 0px; margin: 0px;">
                    <div class="info-box" style="margin-bottom: 1px;">
                        <span class="info-box-icon bg-green"><i class="fa fa-pencil"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Recordings Transcribed</span>
                            <span class="info-box-number timeframe" id="recordingTranscribed">0</span>
                        </div>
                        <!-- /.info-box-content -->
                    </div>
                    <!-- /.info-box -->
                </div>
                <div class="col-xs-6 col-md-3" style="padding: 0px; margin: 0px;">
                    <div class="info-box" style="margin-bottom: 1px;">
                        <span class="info-box-icon bg-yellow"><i class="fa fa-microchip"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Recordings Analyzed</span>
                            <span class="info-box-number timeframe" id="recordingAnalyzed">0</span>
                        </div>
                        <!-- /.info-box-content -->
                    </div>
                    <!-- /.info-box -->
                </div>
            </div>
        </div>
    </div>

    <hr style="border-top: 1px solid #d6d5d5;" />
</section>
<!-- /.content -->

<div class="hidden" id="maxFreeCalls"><?php echo e($customer->maxFreeCalls); ?></div>


<script>
$(document).ready(function() {
    var response;
    var x;
    setInterval(function() {
        $.getJSON('rest/app/counters', function(data) {
            console.log(data);

            for (var counter in data.data) {
                if (counter == 'userId') continue;

                if (data.data.hasOwnProperty(counter)) {
                    if (counter == 'freeCalls') {
                        $('#' + counter).html(data.data[counter] + ' / ' + $('#maxFreeCalls')
                            .html());
                    }

                    if (counter == 'all-updatetime') {
                        $('#' + counter).html(data.data[counter]);
                    }
                }
            }
        });

        const query = {
            startDate: $('#report-range').data('daterangepicker').startDate.format('YYYY-MM-DD'),
            endDate: $('#report-range').data('daterangepicker').endDate.format('YYYY-MM-DD')
        };

        $.getJSON('rest/app/counters/timeframe?' + $.param(query), function(data) {

            $('.timeframe').html('0');

            for (var counter in data.data) {
                if (counter == 'userId' || counter == 'freeCalls') continue;
                if (counter == 'all-updatetime') {
                    $('#' + counter).html(data.data[counter]);
                    continue;
                }
                if (data.data.hasOwnProperty(counter)) {
                    if (counter == 'recordingDuration') {
                        $('#' + counter).html(numberWithCommas(Math.floor(data.data[counter] /
                            60)));
                    } else if (counter == 'cost') {
                        $('#' + counter).html('$' + data.data[counter]);
                    } else {
                        $('#' + counter).html(numberWithCommas(data.data[counter]));
                    }
                }
            }
        })
    }, 60000);
});
</script><?php /**PATH /home/sanaullah/Desktop/Senarios/Code/ConvirzaaAI/resources/views/appPages/dashboard.blade.php ENDPATH**/ ?>