// See LICENSE.MD for license information.

var app = angular.module('MSPoc', ['ngRoute', 'ngStorage']);

app.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<div class="loader"><img src="img/spinner.gif"></div>',
        link: function (scope, element, attr) {
              scope.$watch('loading', function (val) {
                  if (val)
                      $(element).show();
                  else
                      $(element).hide();
              });
        }
      }
  })
/*********************************
 Controllers
 *********************************/
app.controller('HeaderController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Set local scope to persisted user data
    $scope.user = $localStorage;

    // Logout function
    $scope.logout = function(){
                  $scope.loading = false;
                  $localStorage.$reset();
                  $localStorage.status=false;
                  $location.path('/login');
                  }

  $('#viewDoco').click(function(){
      $('#viewDoco').modal('hide');
  })
});

app.controller('HomeController', function($scope, $localStorage, $sessionStorage, $location){
  $scope.user = $localStorage;
  if ($scope.user.status==false) {$location.path('/login');}
  if ($scope.user.caseid==''||$scope.user.caseid===undefined) {
    $('.alert').hide();
  }
  else {
    $('#msg').text("Case ID : "+$scope.user.caseid+" has been generated successfully!");
    $('.alert').show();
    $scope.user.caseid=''
  }
});

app.controller('LoginController', function($scope, $localStorage, $sessionStorage, $location, $http){
  $scope.user = $localStorage;
  $('#lErrDiv').css("display","none");
  $('#btnlErr').click(function(){
    $('#loginmsg').text("");
    $('#lErrDiv').css("display","none");
   });

  if ($scope.user.status==true) {$location.path('/');$scope.loading = false;}
    // Login submission
    $scope.submitLogin = function(){
        $scope.loading = true;
        // Login request
        $http({
            method: 'GET',
            url: '/userlogin',
            headers: {
                    'username': $scope.loginForm.username,
                    'password': $scope.loginForm.password,
                    'cat_type':'ms',
                    'func_type':'login'
                }
            })
            .success(function(res){
                // $localStorage persists data in browser's local storage (prevents data loss on page refresh)
                if($.isArray(res)){
                  $scope.loading = false;
                  $localStorage.status = true;
                  $localStorage.userid = $scope.loginForm.username;
                  $localStorage.agentid = res[0].agentId;
                  $localStorage.role = res[0].role;
                  $localStorage.name = res[0].username;
                  if ($localStorage.role.toLowerCase()=='reviewer'||$localStorage.role.toLowerCase()=='officer'){
                    $localStorage.showdecl=false;
                    $localStorage.showtrack=true;
                    $localStorage.showcsr=false;
                  };
                  if ($localStorage.role.toLowerCase()=='agent'){
                    $localStorage.showdecl=true;
                    $localStorage.showtrack=true;
                    $localStorage.showcsr=true;
                  };
                  if ($localStorage.role.toLowerCase()=='csr'){
                    $localStorage.showdecl=false;
                    $localStorage.showtrack=false;
                    $localStorage.showcsr=true;
                  };
                  $location.path('/');
                }
                else {
                  $scope.loading = false;
                  $('#loginmsg').text('Login failed. Check username/password and try again.');
                  $('#lErrDiv').css("display","block");
                }
            })
            .error(function(e){
                $scope.loading = false;
                $('#loginmsg').text('Login failed. Check username/password and try again.');
                $('#lErrDiv').css("display","block");
            }
        );
    };
});

app.controller('CreateController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $scope.loading = true;
  $scope.user.caseid = '';
  if ($scope.user.status==false) {$location.path('/login');}

   $('#cErrDiv').css("display","none");

  $http({ method: 'GET', url: '/query/dropdowns', headers: {'cat_type':'regime'}})
    .success(function (data, status, headers, config) {
      $scope.regimes=data.Array;
      $scope.loading = false;
    })
    .error(function (data, status, headers, config) {
      $scope.loading = false;
    });
    $scope.loading = true;
    $http({ method: 'GET', url: '/query/dropdowns', headers: {'cat_type':'decl'}})
      .success(function (data, status, headers, config) {
        $scope.decls=data.Array;
        $scope.loading = false;
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
      });
      $scope.loading = true;
      $http({ method: 'GET', url: '/query/codes', headers: {'cat_type':'importer'}})
          .success(function (data, status, headers, config) {
            $scope.importersraw=data.Array;
            var importersStrip=[];
            for (var i = 0; i < $scope.importersraw.length; i++) {
                importersStrip[i]=$scope.importersraw[i].value;
            }
            $("#importerCode").autocomplete({source: importersStrip});
            $scope.loading = false;
          })
          .error(function (data, status, headers, config) {
            $scope.loading = false;
          });
      $(document).ready(function(){
        $('#prg1').css('width', '0%');
        $('#prg2').css('width', '0%');
        $('#prg3').css('width', '0%');
        var date_input=$('input[name="invoiceDate"]');
        var container=$('.container-fluid form').length>0 ? $('.container-fluid form').parent() : "body";
        var options={
          format: 'mm/dd/yyyy',
          container: container,
          todayHighlight: true,
          autoclose: true
        };
        date_input.datepicker(options);
      })

      $('#addImportCode').on("hide", function() {
          console.log("browser page has been hidden");
      });

      $('#btnNext1').click(function(){
          checkFields1();
       });

       $('#btnNext2').click(function(){
          checkFields2();
        });

        $('.trigbtn').click(function(){
          $('#newImportCode').val('');
          $('#msgCode').text("");
         });

        $('#btnErr').click(function(){
          $('#createmsg').text("");
          $('#cErrDiv').css("display","none");
         });

      $(".prg1").blur(function() {
        setProgress1();
      })
      $(".prg2").blur(function() {
        setProgress2();
      })
      $(".prg3").blur(function() {
        setProgress3();
      })

      $scope.submitRecord=false;

      $scope.updateImport = function(){
        $scope.loading = true;
        $http({
            method: 'POST',
            url: '/update/addimportcode',
            headers: {'content-type': 'application/json; charset=UTF-8',
                      'id':$scope.importersraw.length+1,
                      'icode':$scope.updateImportForm.newImportCode
                      }
            }) //http End
            .success(function(res){
                $scope.loading = false;
                if (res.fault_code==0){
                  $('#msgCode').addClass('msgSuccess');
                  $('#msgCode').text('Import code successfully added!');
                  $http({ method: 'GET', url: '/query/codes', headers: {'cat_type':'importer'}})
                      .success(function (data, status, headers, config) {
                        $scope.importersraw=data.Array;
                        var importersStrip=[];
                        for (var i = 0; i < $scope.importersraw.length; i++) {
                            importersStrip[i]=$scope.importersraw[i].value;
                        }
                        $("#importerCode").autocomplete({source: importersStrip});
                        $scope.loading = false;
                      })
                      .error(function (data, status, headers, config) {
                        // ...decls
                      });
                }
                else {
                  $('#msgCode').addClass('msgFail');
                  $('#msgCode').text('Error adding Import code!');
                }
            })
            .error(function(res){
              $scope.loading = false;
              $('#msgCode').addClass('msgFail');
              $('#msgCode').text('Error adding Import code!');
            });

      }

      // Create submission
      $scope.submitCreateForm = function(){
          if (checkFields3()!=0){return};
          $scope.loading = true;
          var action = '';
          if ($scope.submitRecord==false){action='Draft';} else {action='Submitted';}
          var uuid='';
          $http({ method: 'GET', url: '/getUUID'})
          .success(function (resp) {
            uuid=resp;
            // create request
            var invDate = $('#invoiceDate').val();
            $http({
                method: 'POST',
                url: '/create',
                headers: {'content-type': 'application/json; charset=UTF-8',
                          'uuid':resp,
                          'action':action,
                          'userid':$scope.user.userid
                          },
                  data: {'caseId': '',
                      'declarationId': '',
                      'agentId': $scope.user.agentid,
                      'declarationCreateDate': '',
                      'caseType': 'declaration',
                      'declarationDetails': {
                        'general': {
                          'regimeType': $scope.createForm.regimeType.value,
                          'declarationType': $scope.createForm.declarationType.value,
                          'cargoChannel': $scope.createForm.cargoChannel,
                          'clientDeclarationNumber': $scope.createForm.clientDecRefNo,
                          'exporterCode': $scope.createForm.exporterCode,
                          'importerCode': $scope.createForm.importerCode,
                          'cargoHandlersCode': $scope.createForm.cargoHandlerCode,
                          'agentCode': $scope.createForm.agentCode
                        },
                        'shippingDetails': {
                          'carrierRegistrationNumber': $scope.createForm.carrierRegNo,
                          'mawb': $scope.createForm.mawbmbol,
                          'hbol': $scope.createForm.hawbhbol,
                          'portOfLoading': $scope.createForm.portLoad,
                          'portOfDischarge': $scope.createForm.portDischarge,
                          'originalLoadPort': $scope.createForm.originalPortLoad,
                          'destinationCountry': $scope.createForm.destCountry,
                          'netWeight': $scope.createForm.netWeight,
                          'netWeightUnit': $scope.createForm.netWeightUnit,
                          'grossWeight': $scope.createForm.grossWeight,
                          'grossWeightUnit': $scope.createForm.grossWeightUnit,
                          'volume': $scope.createForm.volume,
                          'packageDetails': [
                            {
                              'numberOfPackages': $scope.createForm.noofPackages,
                              'unit': $scope.createForm.packageType,
                              'marks': $scope.createForm.shippingMarks
                            }
                          ],
                          'containerDetails': [
                            {
                              'containerNumber': $scope.createForm.containerNo,
                              'containerSealNumber': $scope.createForm.containerSealNo,
                              'containerSize': $scope.createForm.containerSize,
                              'containerType': $scope.createForm.containerType
                            }
                          ]
                        },
                        'invoiceDetails': [
                          {
                            'invoiceNumber': $scope.createForm.invoiceNo,
                            'invoiceDate': invDate,
                            'seller': $scope.createForm.seller,
                            'numberOfPages': $scope.createForm.noofpages,
                            'invoiceType': $scope.createForm.invoiceType,
                            'value': $scope.createForm.invoiceValue,
                            'currency': $scope.createForm.invoiceCurrency,
                            'freightCost': $scope.createForm.freightCost,
                            'freightCostCurrency': $scope.createForm.freightCostCurrency
                          }
                        ]
                      }
                    } // data end
                }) //http End
                .success(function(res){
                    if (res.statusCode==202){
                      $scope.user.caseid=JSON.parse(res.body).caseId;
                      $scope.loading = false;
                      $location.path('/');
                    }
                    else {
                      //$scope.user.createerrorflag=true;
                      $scope.loading = false;
                      showCreateError("Oops! An error occurred while trying to create the declaration!")
                    }
                })
                .error(function(e){
                  //$scope.user.createerrorflag=true;
                  $scope.loading = false;
                  showCreateError("Oops! An error occurred while trying to create the declaration!")
                });
          })
          .error(function (resp) {
          });

      };// create submission end

});

app.controller('TrackController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  if ($scope.user.status==false) {$location.path('/login');}
  $scope.loading = true;
  $('#tErrDiv').css("display","none");
  $('#btntErr').click(function(){
    $('#trackmsg').text("");
    $('#tErrDiv').css("display","none");
   });
   if($scope.user.reviewFormcaseID!==undefined&&$scope.user.reviewFormcaseID!='') {
     showTrackError('Status of Case ID ' + $scope.user.reviewFormcaseID + ' changed to ' + $scope.user.reviewFormstatus + '!',false);
      $scope.user.reviewFormcaseID='';
   } else {
     $scope.user.reviewFormcaseID="";
      $scope.user.reviewFormstatus="";
   }
   $scope.tracks='';
   $http({
       method: 'GET',
       url: '/track',
       headers: {
           'agentid': $scope.user.agentid,
           'role': $scope.user.role
       }
     })
     .success(function(response){
         if(response.statusCode=200){
           $scope.loading = false;
           $scope.tracks=JSON.parse(response.body);
         } else {
           $scope.loading = false;
           showTrackError('No records or an error occurred!',true);
         }
     })
     .error(function(response){
        $scope.loading = false;
        showTrackError('No records or an error occurred!', true);
     });

     // Start GetDeclaration
     $scope.GetDeclaration = function(caseid,casestatus){
       $scope.loading = true;
       $scope.user.casestatus = casestatus;
       $scope.user.reviewcaseid = caseid;
       $http({
           method: 'GET',
           url: '/caseview',
           headers: {'content-type': 'application/json; charset=UTF-8',
                     'caseid':caseid
                     }
           }) //http End
           .success(function(res){
              $scope.loading = false;
              $scope.reviewData=null;
              $scope.user.reviewData=JSON.parse(res.body);
              sessionStorage.setItem('currentcase', JSON.stringify(res.body));
              $location.path('/review');
           })
           .error(function(res){
             $scope.loading = false;
             showTrackError('Error getting declaration details!',true);
           });
     }
     //End GetDeclaration
     $scope.serviceRequestForm=null;
     //Start RaiseRequest
      $scope.RaiseRequest = function(caseid, casestatus){
        $scope.serviceRequestForm.casestatus = '';
        $scope.serviceRequestForm.caseid = '';
        $scope.serviceRequestForm.casestatus = casestatus;
        $scope.serviceRequestForm.caseid = caseid;
        $('#addServiceRequest').modal('show');
      }
     //End RaiseRequest

     $scope.submitServiceRequest = function(){
      $scope.loading = true;
      $('#addServiceRequest').modal('hide');
       $http({
             method: 'POST',
             url: '/srupdate',
             headers: {'content-type': 'application/json; charset=UTF-8'},
             data:{
                   "caseId": "",
                   "associatedCaseId": $scope.serviceRequestForm.caseid,
                   "requesterId": $scope.user.userid,
                   "agentId": $scope.user.agentid,
                   "servicerequest_details": [
                     {
                       "csrId": "",
                       "userId": $scope.user.userid,
                       "creationCreateDate": "",
                       "creationTime": "",
                       "requestSummary": $scope.serviceRequestForm.reqSummary,
                       "requestDetails": $scope.serviceRequestForm.reqComments
                     }
                   ]
              }
           }) //http End
           .success(function(res){
              $scope.loading = false;
              $scope.serviceRequestForm.reqSummary='';
              $scope.serviceRequestForm.reqComments='';
              if (res.statusCode='200') {
                showTrackError('Service Request with Case ID ' + JSON.parse(res.body).caseId + ' created for original Case ID' + JSON.parse(res.body).associatedCaseId + '!', false);
              } else {
                showTrackError('Error updating service request!', true);
              }
           })
           .error(function(res){
             $scope.loading = false;
             $scope.serviceRequestForm.reqSummary='';
             $scope.serviceRequestForm.reqComments='';
             showTrackError('Error updating service request!', true);
           });
     }

    $("#caseID").on("keyup", function(){
    var value = $(this).val();
    $("table tr").each(function(index) {
        if (index != 0) {
            $row = $(this);
            var id = $row.find("td:first").text();
            if (id.indexOf(value) != 0) {$(this).hide();}
            else {$(this).show();}
        }
      })
    })
    $("#agentID").on("keyup", function(){
    var value = $(this).val();
    $("table tr").each(function(index) {
        if (index != 0) {
            $row = $(this);
            var id = $row.find("td:eq(2)").text();
            if (id.indexOf(value) != 0) {$(this).hide();}
            else {$(this).show();}
        }
      })
    })
    $("#casetype").on("change", function(){
      var value = $("#casetype option:selected").text().toLowerCase().replace(/ /g,'');
      if (value!=='choosecasetype'){
      $("table tr").each(function(index) {
          if (index != 0) {
              $row = $(this);
              var id = $row.find("td:eq(1)").text().toLowerCase();
              if (id.indexOf(value) != 0) {$(this).hide();}
              else {$(this).show();}
          }
        })
      } else {
        $("table tr").each(function(index) {
            if (index != 0) {
                $(this).show();
            }
          })
      }
    })

    $("#status").on("change", function(){
      var value = $("#status option:selected").text().toLowerCase().replace(/ /g,'');
      if (value!='choosestatus'){
      $("table tr").each(function(index) {
          if (index != 0) {
              $row = $(this);
              var id = $row.find("td:eq(3)").text().toLowerCase();
              if (id.indexOf(value) != 0) {$(this).hide();}
              else {$(this).show();}
          }
        })
      } else {
        $("table tr").each(function(index) {
            if (index != 0) {
                $(this).show();
            }
          })
      }
    })

});//end of track controller

app.controller('CustomerController', function($scope, $localStorage, $location, $http){
  $scope.user = $localStorage;
  if ($scope.user.status==false) {$location.path('/login');}
  $('#sErrDiv').css("display","none");
  $('#btnsErr').click(function(){
    $('#servicemsg').text("");
    $('#sErrDiv').css("display","none");
   });
  $scope.submitCsrForm = function() {
      $scope.loading=true;
      $http({
          method: 'POST',
          url: '/srupdate',
          data:{
                "caseId": "",
                "associatedCaseId": $scope.csrForm.reqCaseId,
                "requesterId": $scope.user.userid,
                "agentId": $scope.user.agentid,
                "servicerequest_details": [
                  {
                    "csrId": "",
                    "userId": $scope.user.userid,
                    "creationCreateDate": "",
                    "creationTime": "",
                    "requestSummary": $scope.csrForm.reqSummary,
                    "requestDetails": $scope.csrForm.reqDetails
                  }
                ]
              }
      })
      .success(function(res){
          $scope.loading=false;
          $scope.csrForm.reqCaseId='';
          $scope.csrForm.reqSummary='';
          $scope.csrForm.reqDetails='';
          if (res.statusCode=='200') {
            showServiceError('Service Request with Case ID ' + JSON.parse(res.body).caseId + ' created for original Case ID' + JSON.parse(res.body).associatedCaseId + '!', false);
          } else {
            showServiceError('Error updating service request!', true);
          }
      })
      .error(function(response){
          $scope.loading=false;
          showServiceError('Error processing service request!',true);
      });
    }
});

app.controller('ReviewController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $scope.reviewForm = null;
  if ($scope.user.status==false) {$location.path('/login');}
  if ($scope.user.role.toLowerCase()=='agent') {
    if ($scope.user.casestatus.toLowerCase()=='draft'||$scope.user.casestatus.toLowerCase()=='returned'){
      $scope.disable=false;
    } else {
      $scope.disable=true;
    }
  } else {
    $scope.disable=true;
  }

  if ($scope.user.role.toLowerCase()=='agent') {
    if ($scope.user.casestatus.toLowerCase()=='draft'||$scope.user.casestatus.toLowerCase()=='returned'){
      $scope.saveShow=true;
      $scope.submitShow=true;
      $scope.returnShow=false;
      $scope.rejectShow=false;
      $scope.inspectShow=false;
      $scope.approveShow=false;
    } else {
      $scope.saveShow=false;
      $scope.submitShow=false;
      $scope.returnShow=false;
      $scope.rejectShow=false;
      $scope.inspectShow=false;
      $scope.approveShow=false;
    }
  }

  if ($scope.user.role.toLowerCase()=='reviewer') {
    $scope.saveShow=false;
    $scope.submitShow=false;
    $scope.returnShow=true;
    $scope.rejectShow=true;
    $scope.inspectShow=true;
    $scope.approveShow=false;
  }

  if ($scope.user.role.toLowerCase()=='officer') {
    $scope.saveShow=false;
    $scope.submitShow=false;
    $scope.returnShow=true;
    $scope.rejectShow=true;
    $scope.inspectShow=false;
    $scope.approveShow=true;
  }

  if ($scope.user.role.toLowerCase()=='csr') {
    $scope.saveShow=false;
    $scope.submitShow=false;
    $scope.returnShow=false;
    $scope.rejectShow=false;
    $scope.inspectShow=false;
    $scope.approveShow=false;
  }

  $('#rErrDiv').css("display","none");
  $('#btnNext1').click(function(){
      checkFields1();
   });

   $('#btnNext2').click(function(){
      checkFields2();
    });
    var date_input=$('#invoiceDate');
    var container=$('.container-fluid form').length>0 ? $('.container-fluid form').parent() : "body";
    var options={
      format: 'mm/dd/yyyy',
      container: container,
      todayHighlight: true,
      autoclose: true
    };
    date_input.datepicker(options);
    $scope.loading = true;
    $http({ method: 'GET', url: '/query/dropdowns', headers: {'cat_type':'decl'}})
      .success(function (data, status, headers, config) {
        $scope.decls=data.Array;
        $scope.reviewForm.regimeType = $scope.user.reviewData.declarationDetails.general.regimeType
        $scope.reviewForm.declarationType = $scope.user.reviewData.declarationDetails.general.declarationType
        $scope.reviewForm.cargoChannel = $scope.user.reviewData.declarationDetails.general.cargoChannel
        $scope.reviewForm.clientDecRefNo = $scope.user.reviewData.declarationDetails.general.clientDeclarationNumber
        $scope.reviewForm.exporterCode = $scope.user.reviewData.declarationDetails.general.exporterCode
        $scope.reviewForm.importerCode = $scope.user.reviewData.declarationDetails.general.importerCode
        $scope.reviewForm.cargoHandlerCode = $scope.user.reviewData.declarationDetails.general.cargoHandlersCode
        $scope.reviewForm.agentCode = $scope.user.reviewData.declarationDetails.general.agentCode
        $scope.reviewForm.carrierRegNo = $scope.user.reviewData.declarationDetails.shippingDetails.carrierRegistrationNumber
        $scope.reviewForm.mawbmbol = $scope.user.reviewData.declarationDetails.shippingDetails.mawb
        $scope.reviewForm.hawbhbol = $scope.user.reviewData.declarationDetails.shippingDetails.hbol
        $scope.reviewForm.portLoad = $scope.user.reviewData.declarationDetails.shippingDetails.portOfLoading
        $scope.reviewForm.portDischarge = $scope.user.reviewData.declarationDetails.shippingDetails.portOfDischarge
        $scope.reviewForm.originalPortLoad = $scope.user.reviewData.declarationDetails.shippingDetails.originalLoadPort
        $scope.reviewForm.destCountry = $scope.user.reviewData.declarationDetails.shippingDetails.destinationCountry
        $scope.reviewForm.netWeight = $scope.user.reviewData.declarationDetails.shippingDetails.netWeight
        $scope.reviewForm.netWeightUnit = $scope.user.reviewData.declarationDetails.shippingDetails.netWeightUnit
        $scope.reviewForm.grossWeight = $scope.user.reviewData.declarationDetails.shippingDetails.grossWeight
        $scope.reviewForm.grossWeightUnit = $scope.user.reviewData.declarationDetails.shippingDetails.grossWeightUnit
        $scope.reviewForm.volume = $scope.user.reviewData.declarationDetails.shippingDetails.volume
        $scope.reviewForm.noofPackages = $scope.user.reviewData.declarationDetails.shippingDetails.packageDetails[0].numberOfPackages
        $scope.reviewForm.packageType = $scope.user.reviewData.declarationDetails.shippingDetails.packageDetails[0].unit
        $scope.reviewForm.shippingMarks = $scope.user.reviewData.declarationDetails.shippingDetails.packageDetails[0].marks
        $scope.reviewForm.containerNo = $scope.user.reviewData.declarationDetails.shippingDetails.containerDetails[0].containerNumber
        $scope.reviewForm.containerSealNo = $scope.user.reviewData.declarationDetails.shippingDetails.containerDetails[0].containerSealNumber
        $scope.reviewForm.containerSize = $scope.user.reviewData.declarationDetails.shippingDetails.containerDetails[0].containerSize
        $scope.reviewForm.containerType = $scope.user.reviewData.declarationDetails.shippingDetails.containerDetails[0].containerType
        $scope.reviewForm.invoiceNo = $scope.user.reviewData.declarationDetails.invoiceDetails[0].invoiceNumber
        $scope.reviewForm.invoiceDate = $scope.user.reviewData.declarationDetails.invoiceDetails[0].invoiceDate
        $scope.reviewForm.seller = $scope.user.reviewData.declarationDetails.invoiceDetails[0].seller
        $scope.reviewForm.noofpages = $scope.user.reviewData.declarationDetails.invoiceDetails[0].numberOfPages
        $scope.reviewForm.invoiceType = $scope.user.reviewData.declarationDetails.invoiceDetails[0].invoiceType
        $scope.reviewForm.invoiceValue = $scope.user.reviewData.declarationDetails.invoiceDetails[0].value
        $scope.reviewForm.invoiceCurrency = $scope.user.reviewData.declarationDetails.invoiceDetails[0].currency
        $scope.reviewForm.freightCost = $scope.user.reviewData.declarationDetails.invoiceDetails[0].freightCost
        $scope.reviewForm.freightCostCurrency = $scope.user.reviewData.declarationDetails.invoiceDetails[0].freightCostCurrency
      })
      .error(function (data, status, headers, config) {
        showReviewError("Oops! An error occurred while trying to obtain the declaration!")
      });
      $http({ method: 'GET', url: '/comments', headers: {'caseid':$scope.user.reviewcaseid}})
        .success(function (res) {
          $scope.loading = false;
          if (res.statusCode==200) {
            var commie='';
            var noitems=JSON.parse(res.body).observations.length;
            for (i=0;i<noitems;i++){
              commie=commie+"\n"+"Case Summary :"+"\n"+JSON.parse(res.body).observations[i].caseSummary+"\n"+" Case Details :"+"\n"+JSON.parse(res.body).observations[i].caseDetails+"\n\n";
              $scope.haveComments=true;
            }
            $scope.reviewForm.comments=commie;
          }
        })
        .error(function (res) {
          $scope.loading = false;
          showReviewError("Oops! An error occurred while trying to obtain comments!")
        });

  $scope.submitReviewForm = function(){
    if ($scope.SubmitStatusType=='Draft'){action='Draft';} else {action='Submitted';}
    $scope.reviewForm.caseID = $scope.user.reviewcaseid;
    $scope.reviewForm.status = $scope.SubmitStatusType;
    $scope.loading=true;
    var invDate='';
    invDate=$('#invoiceDate').val();
    $http({
        method: 'POST',
        url: '/create',
        headers: {'content-type': 'application/json; charset=UTF-8',
                  'action':action
                  },
          data: {'caseId': $scope.user.reviewcaseid,
              'declarationId': '',
              'agentId': $scope.user.agentid,
              'declarationCreateDate': '',
              'caseType': 'declaration',
              'declarationDetails': {
                'general': {
                  'regimeType': $scope.reviewForm.regimeType,
                  'declarationType': $scope.reviewForm.declarationType,
                  'cargoChannel': $scope.reviewForm.cargoChannel,
                  'clientDeclarationNumber': $scope.reviewForm.clientDecRefNo,
                  'exporterCode': $scope.reviewForm.exporterCode,
                  'importerCode': $scope.reviewForm.importerCode,
                  'cargoHandlersCode': $scope.reviewForm.cargoHandlerCode,
                  'agentCode': $scope.reviewForm.agentCode
                },
                'shippingDetails': {
                  'carrierRegistrationNumber': $scope.reviewForm.carrierRegNo,
                  'mawb': $scope.reviewForm.mawbmbol,
                  'hbol': $scope.reviewForm.hawbhbol,
                  'portOfLoading': $scope.reviewForm.portLoad,
                  'portOfDischarge': $scope.reviewForm.portDischarge,
                  'originalLoadPort': $scope.reviewForm.originalPortLoad,
                  'destinationCountry': $scope.reviewForm.destCountry,
                  'netWeight': $scope.reviewForm.netWeight,
                  'netWeightUnit': $scope.reviewForm.netWeightUnit,
                  'grossWeight': $scope.reviewForm.grossWeight,
                  'grossWeightUnit': $scope.reviewForm.grossWeightUnit,
                  'volume': $scope.reviewForm.volume,
                  'packageDetails': [
                    {
                      'numberOfPackages': $scope.reviewForm.noofPackages,
                      'unit': $scope.reviewForm.packageType,
                      'marks': $scope.reviewForm.shippingMarks
                    }
                  ],
                  'containerDetails': [
                    {
                      'containerNumber': $scope.reviewForm.containerNo,
                      'containerSealNumber': $scope.reviewForm.containerSealNo,
                      'containerSize': $scope.reviewForm.containerSize,
                      'containerType': $scope.reviewForm.containerType
                    }
                  ]
                },
                'invoiceDetails': [
                  {
                    'invoiceNumber': $scope.reviewForm.invoiceNo,
                    'invoiceDate': invDate,
                    'seller': $scope.reviewForm.seller,
                    'numberOfPages': $scope.reviewForm.noofpages,
                    'invoiceType': $scope.reviewForm.invoiceType,
                    'value': $scope.reviewForm.invoiceValue,
                    'currency': $scope.reviewForm.invoiceCurrency,
                    'freightCost': $scope.reviewForm.freightCost,
                    'freightCostCurrency': $scope.reviewForm.freightCostCurrency
                  }
                ]
              }
            } // data end
        }) //http End
        .success(function(res){
            if (res.statusCode==202){
              $scope.loading = false;
              $scope.user.reviewFormcaseID=$scope.reviewForm.caseID;
              $scope.user.reviewFormstatus=$scope.reviewForm.status;
              $location.path('/track');
            }
            else {
              $scope.loading = false;
              showReviewError("Oops! An error occurred while trying to update the declaration!")
            }
        })
        .error(function(e){
          $scope.loading = false;
          showReviewError("Oops! An error occurred while trying to update the declaration!")
        });

  }; //submitReviewForm

   $scope.StatusChange = function (stat){
     $scope.reviewForm.caseID = $scope.user.reviewcaseid;
     $scope.reviewForm.status = $scope.SubmitStatusType;
     if ($scope.SubmitStatusType=='Returned'||$scope.SubmitStatusType=='Rejected'){
       $('#addReviewComments').modal('show');
     }
     if ($scope.SubmitStatusType=='Inspect'||$scope.SubmitStatusType=='Approved'){
       $scope.loading=true;
       $http({
           method: 'PUT',
           url: '/statusupdate',
           headers:{
             'caseid': $scope.reviewForm.caseID,
             'status': $scope.reviewForm.status,
           }
         })
         .success(function(response){
           $scope.loading=false;
           $scope.user.reviewFormcaseID=$scope.reviewForm.caseID;
           $scope.user.reviewFormstatus=$scope.reviewForm.status;
           $location.path('/track');
         })
         .error(function(response){
           $scope.loading=false;
           showReviewError('Error updating the status of caseID ' + $scope.reviewForm.caseID + ' to ' + $scope.reviewForm.status + '!');
         });
     }

   } //StatusChange END

   $scope.updateReviewComm = function() {
     $scope.loading=true;
     $http({
         method: 'PUT',
         url: '/statusupdate',
         headers:{
           'caseid': $scope.reviewForm.caseID,
           'status': $scope.reviewForm.status,
         },
         data: {
             'caseType':'declaration',
             'summary': $scope.updateReviewForm.comSummary,
             'detailedcomment' : $scope.updateReviewForm.comComments
         }
       })
       .success(function(response){
         $scope.loading=false;
         $scope.updateReviewForm.comSummary='';
         $scope.updateReviewForm.comComments='';
         $('#addReviewComments').modal('toggle');
         $scope.user.reviewFormcaseID=$scope.reviewForm.caseID;
         $scope.user.reviewFormstatus=$scope.reviewForm.status;
         $location.path('/track');
       })
       .error(function(response){
         $scope.loading=false;
         $('#addReviewComments').modal('toggle');
         showReviewError('Error updating the status of caseID ' + $scope.reviewForm.caseID + ' to ' + $scope.reviewForm.status + '!');
       });

   } //updateReviewComm END

   $('#btnrErr').click(function(){
     $('#reviewmsg').text("");
     $('#rErrDiv').css("display","none");
    });

}); //Review Controller END


/*********************************
 Routing
 *********************************/
app.config(function($routeProvider) {
    'use strict';

    $routeProvider.

        //Root
        when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        }).

        //Root
        when('/#', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        }).

        //Login page
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).

        //Account page
        when('/track', {
            templateUrl: 'views/track.html',
            controller: 'TrackController'
        }).

        //Create Account page
        when('/create', {
            templateUrl: 'views/create.html',
            controller: 'CreateController'
        }).

        //Protected page
        when('/customer', {
            templateUrl: 'views/customer.html',
            controller: 'CustomerController'
        }).

        //Protected page
        when('/review', {
            templateUrl: 'views/review.html',
            controller: 'ReviewController'
        });

});

function checkFields1(){
  $('#cErrDiv').css("display","none");
  var check=0;
  if($('#regimeType option:selected').text()==''){$('#regimeType').addClass('err');check=1;}
  if($('#declarationType option:selected').text()==''){$('#declarationType').addClass('err');check=1;}
  if($('#cargoChannel option:selected').text()==''){$('#cargoChannel').addClass('err');check=1;}
  if($('#clientDecRefNo').val()==''){$('#clientDecRefNo').addClass('err');check=1;}
  if($('#exporterCode').val()==''){$('#exporterCode').addClass('err');check=1;}
  if($('#importerCode').val()==''){$('#importerCode').addClass('err');check=1;}
  if($('#cargoHandlerCode').val()==''){$('#cargoHandlerCode').addClass('err');check=1;}
  if($('#agentCode').val()==''){$('#agentCode').addClass('err');check=1;}
  if (check==0) {
     $('.nav-pills > .active').next('li').find('a').trigger('click');
  }
  else {
    showCreateError("Please fill in all required fields!")
  }
}

function checkFields2(){
  $('#cErrDiv').css("display","none");
  var check=0;
  var msg='';
  if($('#carrierRegNo').val()==''){$('#carrierRegNo').addClass('err');check=1;}
  if($('#mawbmbol').val()==''){$('#mawbmbol').addClass('err');check=1;}
  if($('#hawbhbol').val()==''){$('#hawbhbol').addClass('err');check=1;}
  if($('#portLoad option:selected').text()==''){$('#portLoad').addClass('err');check=1;}
  if($('#portDischarge option:selected').text()==''){$('#portDischarge').addClass('err');check=1;}
  if($('#originalPortLoad option:selected').text()==''){$('#originalPortLoad').addClass('err');check=1;}
  if($('#destCountry option:selected').text()==''){$('#destCountry').addClass('err');check=1;}
  if($('#netWeight').val()==''){$('#netWeight').addClass('err');check=1;}
  if(!$.isNumeric($('#netWeight').val()))
  {$('#netWeight').addClass('err');check=1;msg=msg +' Net Weight should be numeric!'}
  if($('#netWeightUnit option:selected').text()==''){$('#netWeightUnit').addClass('err');check=1;}
  if($('#grossWeight').val()==''){$('#grossWeight').addClass('err');check=1;}
  if(!$.isNumeric($('#grossWeight').val()))
  {$('#grossWeight').addClass('err');check=1;msg=msg +' Gross Weight should be numeric!'}
  if($('#grossWeightUnit option:selected').text()==''){$('#grossWeightUnit').addClass('err');check=1;}
  if($('#volume').val()==''){$('#volume').addClass('err');check=1;}
  if(!$.isNumeric($('#volume').val()))
  {$('#volume').addClass('err');check=1;msg=msg +' Volume should be numeric!'}
  if($('#noofPackages').val()==''){$('#noofPackages').addClass('err');check=1;}
  if(!$.isNumeric($('#noofPackages').val()))
  {$('#noofPackages').addClass('err');check=1;msg=msg +' No of Packages should be numeric!'}
  if($('#packageType option:selected').text()==''){$('#packageType').addClass('err');check=1;}
  if($('#shippingMarks').val()==''){$('#shippingMarks').addClass('err');check=1;}
  if($('#containerNo').val()==''){$('#containerNo').addClass('err');check=1;}
  if($('#containerSealNo').val()==''){$('#containerSealNo').addClass('err');check=1;}
  if($('#containerSize option:selected').text()==''){$('#containerSize').addClass('err');check=1;}
  if($('#containerType option:selected').text()==''){$('#containerType').addClass('err');check=1;}
  if (check==0) {
     $('.nav-pills > .active').next('li').find('a').trigger('click');
  }
  else {
    showCreateError("Please fill in all required fields! " + msg)
  }
}

function checkFields3(){
  $('#cErrDiv').css("display","none");
  var check=0;
  var msg='';
  if($('#invoiceNo').val()==''){$('#invoiceNo').addClass('err');check=1;}
  if($('#invoiceDate').val()==''){$('#invoiceDate').addClass('err');check=1;}
  if($('#seller').val()==''){$('#seller').addClass('err');check=1;}
  if($('#noofpages').val()==''){$('#noofpages').addClass('err');check=1;}
  if(!$.isNumeric($('#noofpages').val()))
  {$('#noofpages').addClass('err');check=1;msg=msg +' No of Pages should be numeric!'}
  if($('#invoiceType option:selected').text()==''){$('#invoiceType').addClass('err');check=1;}
  if($('#invoiceValue').val()==''){$('#invoiceValue').addClass('err');check=1;}
  if(!$.isNumeric($('#invoiceValue').val()))
  {$('#invoiceValue').addClass('err');check=1;msg=msg +' Invoice Value should be numeric!'}
  if($('#invoiceCurrency option:selected').text()==''){$('#invoiceCurrency').addClass('err');check=1;}
  if($('#freightCost').val()==''){$('#freightCost').addClass('err');check=1;}
  if(!$.isNumeric($('#freightCost').val()))
  {$('#freightCost').addClass('err');check=1;msg=msg +' Freight cost should be numeric!'}
  if($('#freightCostCurrency option:selected').text()==''){$('#freightCostCurrency').addClass('err');check=1;}
  if (check==0) {
     return 0;
  }
  else {
    showCreateError("Please fill in all required fields! " + msg)
  }
}

function setProgress1(){
  var cPrgVal=0;
  if($('#regimeType option:selected').text()!=''){cPrgVal=cPrgVal+4.16;$('#regimeType').removeClass('err');}
  if($('#declarationType option:selected').text()!=''){cPrgVal=cPrgVal+4.16;$('#declarationType').removeClass('err');}
  if($('#cargoChannel option:selected').text()!=''){cPrgVal=cPrgVal+4.16;$('#cargoChannel').removeClass('err');}
  if($('#clientDecRefNo').val()!=''){cPrgVal=cPrgVal+4.16;$('#clientDecRefNo').removeClass('err');}
  if($('#exporterCode').val()!=''){cPrgVal=cPrgVal+4.16;$('#exporterCode').removeClass('err');}
  if($('#importerCode').val()!=''){cPrgVal=cPrgVal+4.16;$('#importerCode').removeClass('err');}
  if($('#cargoHandlerCode').val()!=''){cPrgVal=cPrgVal+4.16;$('#cargoHandlerCode').removeClass('err');}
  if($('#agentCode').val()!=''){cPrgVal=cPrgVal+4.16;$('#agentCode').removeClass('err');}
  $('#prg1').css('width', cPrgVal+'%');
}

function setProgress2(){
  var cPrgVal=0;
  if($('#carrierRegNo').val()!=''){cPrgVal=cPrgVal+1.75;$('#carrierRegNo').removeClass('err');}
  if($('#mawbmbol').val()!=''){cPrgVal=cPrgVal+1.75;$('#mawbmbol').removeClass('err');}
  if($('#hawbhbol').val()!=''){cPrgVal=cPrgVal+1.75;$('#hawbhbol').removeClass('err');}
  if($('#portLoad option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#portLoad').removeClass('err');}
  if($('#portDischarge option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#portDischarge').removeClass('err');}
  if($('#originalPortLoad option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#originalPortLoad').removeClass('err');}
  if($('#destCountry option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#destCountry').removeClass('err');}
  if($('#netWeight').val()!=''){cPrgVal=cPrgVal+1.75;$('#netWeight').removeClass('err');}
  if($('#netWeightUnit option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#netWeightUnit').removeClass('err');}
  if($('#grossWeight').val()!=''){cPrgVal=cPrgVal+1.75;$('#grossWeight').removeClass('err');}
  if($('#grossWeightUnit option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#grossWeightUnit').removeClass('err');}
  if($('#volume').val()!=''){cPrgVal=cPrgVal+1.75;$('#volume').removeClass('err');}
  if($('#noofPackages').val()!=''){cPrgVal=cPrgVal+1.75;$('#noofPackages').removeClass('err');}
  if($('#packageType option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#packageType').removeClass('err');}
  if($('#shippingMarks').val()!=''){cPrgVal=cPrgVal+1.75;$('#shippingMarks').removeClass('err');}
  if($('#containerNo').val()!=''){cPrgVal=cPrgVal+1.75;$('#containerNo').removeClass('err');}
  if($('#containerSealNo').val()!=''){cPrgVal=cPrgVal+1.75;$('#containerSealNo').removeClass('err');}
  if($('#containerSize option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#containerSize').removeClass('err');}
  if($('#containerType option:selected').text()!=''){cPrgVal=cPrgVal+1.75;$('#containerType').removeClass('err');}
  $('#prg2').css('width', cPrgVal+'%');
}

function setProgress3(){
  var cPrgVal=0;
  if($('#invoiceNo').val()!=''){cPrgVal=cPrgVal+3.7;$('#invoiceNo').removeClass('err');}
  if($('#invoiceDate').val()!=''){cPrgVal=cPrgVal+3.7;$('#invoiceDate').removeClass('err');}
  if($('#seller').val()!=''){cPrgVal=cPrgVal+3.7;$('#seller').removeClass('err');}
  if($('#noofpages').val()!=''){cPrgVal=cPrgVal+3.7;$('#noofpages').removeClass('err');}
  if($('#invoiceType option:selected').text()!=''){cPrgVal=cPrgVal+3.7;$('#invoiceType').removeClass('err');}
  if($('#invoiceValue').val()!=''){cPrgVal=cPrgVal+3.7;$('#invoiceValue').removeClass('err');}
  if($('#invoiceCurrency option:selected').text()!=''){cPrgVal=cPrgVal+3.7;$('#invoiceCurrency').removeClass('err');}
  if($('#freightCost').val()!=''){cPrgVal=cPrgVal+3.7;$('#freightCost').removeClass('err');}
  if($('#freightCostCurrency option:selected').text()!=''){cPrgVal=cPrgVal+3.7;$('#freightCostCurrency').removeClass('err');}
  $('#prg3').css('width', cPrgVal+'%');
}

function showCreateError(errMsg) {
  $('#createmsg').text(errMsg);
  $('#cErrDiv').css("display","block");
  $('html, body').animate({ scrollTop: $('body').offset().top }, 'slow');
}
function showTrackError(errMsg, typ) {
  if (typ==true){
    $('#tErrDiv').addClass('alert-warning');
    $('#tErrDiv').removeClass('alert-success');
  } else {
    $('#tErrDiv').removeClass('alert-warning');
    $('#tErrDiv').addClass('alert-success');
  }
  $('#trackmsg').text(errMsg);
  $('#tErrDiv').css("display","block");
  $('html, body').animate({ scrollTop: $('body').offset().top }, 'slow');
}
function showReviewError(errMsg) {
  $('#reviewmsg').text(errMsg);
  $('#rErrDiv').css("display","block");
  $('html, body').animate({ scrollTop: $('body').offset().top }, 'slow');
}
function showServiceError(errMsg, typ) {
  if (typ==true){
    $('#sErrDiv').addClass('alert-warning');
    $('#sErrDiv').removeClass('alert-success');
  } else {
    $('#sErrDiv').removeClass('alert-warning');
    $('#sErrDiv').addClass('alert-success');
  }
  $('#servicemsg').text(errMsg);
  $('#sErrDiv').css("display","block");
  $('html, body').animate({ scrollTop: $('body').offset().top }, 'slow');
}
