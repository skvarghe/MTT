// See LICENSE.MD for license information.

var app = angular.module('MTTApp', ['ngRoute', 'ngStorage']);

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
});

/*
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
  $('#msgDiv').css("display","none");
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
*/
app.controller('LoginController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  if ($scope.user.loggedin==true) {
    $location.path('/timesheet');
  } else {
    $scope.user.id='';
    $scope.user.fullname='';
    $scope.user.userrole='';
    $scope.user.email='';
    $scope.user.loggedin=false;
  }
  $scope.submitLogin = function(){
    $http({
      method: 'GET',
      url: '/validate',
      headers:{
        'username':$scope.loginForm.username,
        'password':$scope.loginForm.password
      }

    })
      .success(function (data, status, headers, config) {
        $scope.loading = false;
        if (data.appcode==100) {
          $scope.user.id=data.body.id;
          $scope.user.fullname=data.body.fullname;
          $scope.user.userole=data.body.userrole;
          $scope.user.email=data.body.email;
          $scope.user.loggedin=true;
          $scope.loading = true;
          if (data.body.userole=='admin') {
            $scope.user.admin=true;
          } else {
            $scope.user.normal=true;
          }
          $location.path('/timesheet');
        } else {
          $('#msgDiv').addClass('msgFail');
          $('#msg').text(data.appcode +' - '+ data.appmsg);
          $('#msgDiv').css("display","block");
        }
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
        $('#msgDiv').addClass('msgFail');
        $('#msg').text(data.appcode +' - '+ data.appmsg);
        $('#msgDiv').css("display","block");
      });
  } // Submit Login END

}); //Login Controller END

app.controller('RegisterController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  $scope.submitRegister = function(){
    $http({
      method: 'POST',
      url: '/registration',
      headers:{
        'username':$scope.registerForm.employeeID,
        'password':$scope.registerForm.password,
        'email':$scope.registerForm.email,
        'fullname':$scope.registerForm.fullname
      }
    })
      .success(function (data, status, headers, config) {
        $scope.loading = false;
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
      });
  } // Submit Register END

}); //Register Controller END

app.controller('TimesheetController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  $http({
      method: 'GET',
      url: '/dropdowns',
      headers: {'content-type': 'application/json; charset=UTF-8'}
      }) //http End
      .success(function(res){
          $scope.loading = false;
          if (res.appcode==100){
            for (i=0;i<res.body.length;i++) {
              if(res.body[i].dtid==1) {
                  console.log(res.body[i].did+'~'+res.body[i].dropvalue);
              }
            }
          }
          else {
            $('#msgDiv').addClass('msgFail');
            $('#msg').text('Error getting dropdown values!');
          }
      })
      .error(function(res){
        $scope.loading = false;
        $('#msgDiv').addClass('msgFail');
        $('#msg').text('Error getting dropdown values!');
      });

}); //Timesheet Controller END


app.controller('AdminController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;

}); //Admin Controller END

/*********************************
 Routing
 *********************************/
app.config(function($routeProvider) {
    'use strict';

    $routeProvider.

        //Root
        when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController'
        }).

        //Root
        when('/#', {
            templateUrl: 'views/dashboard.html',
            controller: 'HomeController'
        }).

        //Login page
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).

        //Protected page
        when('/timesheet', {
            templateUrl: 'views/timesheet.html',
            controller: 'TimesheetController'
        }).

        //Protected page
        when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminController'
        });

});
