// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-material','ionic.cloud', 'ionMdInput','ngCordova','angularjs-gauge','chart.js','ion-datetime-picker','ng-mfb'])

.run(function($ionicPlatform, $ionicLoading,$state, $rootScope,$cordovaNativeAudio,$ionicPopup) {
	
    $ionicPlatform.ready(function() {
		// ChartJS
        Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 0.8)';
		Chart.defaults.global.defaultFontFamily = "'Prompt', sans-serif";
		Chart.defaults.global.defaultFontSize = 12;
		Chart.defaults.global.legend.labels.boxWidth = 20;
		Chart.defaults.global.colors  =  ['#2fb8e1','#75afc4','#a3dcdf','#c5dce6','#78ffff','#2ba8cd','#2c6376','#95c8cb','#b4c8d2','#6ee8e8'];
		
		navigator.geolocation.getCurrentPosition(function(pos) {
			console.log("current position "+pos);
		});
		
			// load audio file for alert
		$cordovaNativeAudio
			.preloadSimple('alarmClock', 'audio/alarm.mp3')
			.then(function (msg) {
			  console.log(msg);
			}, function (error) {
			//  alert(error);
			});
		
		var push = PushNotification.init({
			android: {
				"senderID": "1091753368379",
				"iconColor": "#343434",
				"forceShow" : false
			},
			browser: {
				pushServiceURL: 'http://push.api.phonegap.com/v1/push'
			}
		});
		push.on('registration', function(data) {
		  console.log("registrationId "+data.registrationId);
		  $rootScope.tokenId = data.registrationId;
		});
		//$rootScope.isNotificationCalled = false;
		push.on('notification', function ( data) {
			console.log("onNotification");
			//$rootScope.isNotificationCalled is for preventing duplicating alarm from notification
			//if($rootScope.isNotificationCalled == undefined ||  !$rootScope.isNotificationCalled){
				//$rootScope.isNotificationCalled = true;
				$cordovaNativeAudio.loop('alarmClock');
				var msg = data.message;
				console.log("message " + data.title + ": " + msg);
				if(msg.indexOf("SOS Emergency Request") != -1){
					$rootScope.loadEmrequestData();
					msg = msg + "<BR/>โปรดตรวจสอบรายชื่อด้านข้าง ";
				} 
				if($rootScope.alertPopup == null || $rootScope.alertPopup == undefined){
					$rootScope.alertPopup = $ionicPopup.alert({
						title: "ข้อความเตือน",
						template: msg,
						 buttons: [
						  { text: 'OK',  onTap: function(e) {
								  console.log(e);
								  if(data.title.indexOf('Alert') != -1)
									$cordovaNativeAudio.stop('alarmClock');
								  //$rootScope.isNotificationCalled = false;
								  $rootScope.alertPopup = null;
								  return true; 
								} 
						   }
						 ]
					});
				}
				
			//}
		});
		/**
		var permissions = cordova.plugins.permissions;
		permissions.hasPermission(permissions.READ_SMS, function( status ){
		 if ( status.hasPermission ) {
			console.log("READ_SMS Yes :D ");
		  }
		  else {
			console.warn("READ_SMS No :( ");
			permissions.requestPermission(permissions.READ_SMS, success, error);

			function error() {
			  console.warn('SMS permission is not turned on');
			}

			function success( status ) {
			  if( !status.hasPermission ) 
				  console.log("permission is denied");
			  else
				   console.log("permission is granted");
			}
		  }
		});
		
		if(SMS) SMS.startWatch(function(){
        		console.log( 'watching started');
				
        	}, function(){
        		console.log('failed to start watching');
        	});
		document.addEventListener('onSMSArrive', function(e){
				console.log('SMS Arrived');
				var data = e.data;
				$rootScope.submitRequest(data.address);
				console.log(JSON.stringify(data));
			},false);
		**/
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,$ionicCloudProvider) {

    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);

    /*
    // Turn off back button text
	*/
    $ionicConfigProvider.backButton.previousTitleText(false);
 

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
   
    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
        }
    })
	
	.state('app.logout', {
		url: '/logout',
		views: {
            'menuContent': {
			templateUrl: 'templates/login.html',
			controller: 'LogoutCtrl'
			},
		}
	})

    .state('app.home', {
        url: '/home/:showIndex',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            },
            'fabContent': {
                controller: function ($timeout) {
                }
				
            }
        }
    })
	.state('app.dashboard', {
        url: '/dashboard',
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl'
            },
            'fabContent': {
                
            }
        }
    })
	
	 .state('app.register', {
        url: '/register',
        views: {
            'menuContent': {
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            },
            'fabContent': {}
            }
    })

    .state('app.patientList', {
		url: '/patientList',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/patientList.html',
			controller: 'PatientListCtrl'
			},
		}
    })
    
    .state('app.patientForm', {
		url: '/patientForm',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/patientForm.html',
			controller: 'PatientFormCtrl'
			},
		}
    })

    .state('app.emcenterList', {
		url: '/emcenterList',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/emcenterList.html',
			controller: 'EmcenterListCtrl'
			},
		}
    })
    
    .state('app.emcenterForm', {
		url: '/emcenterForm',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/emcenterForm.html',
			controller: 'EmcenterFormCtrl'
			},
		}
    })
    
    .state('app.caregiverList', {
		url: '/caregiverList',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/caregiverList.html',
			controller: 'CaregiverListCtrl'
			},
		}
    })

    .state('app.caregiverForm', {
		url: '/caregiverForm',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/caregiverForm.html',
			controller: 'CaregiverFormCtrl'
			},
		}
    })
     .state('app.emrequestLogList', {
		url: '/emrequestLogList/:requestid',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/emreqeustLogList.html',
			controller: 'EmrequestLogListCtrl'
			},
		}
    })
	.state('app.emrequestLogForm', {
		url: '/emrequestLogForm/:requestid/:direction',
		views: {
            'menuContent': {
			templateUrl: 'templates/pages/emrequestLogForm.html',
			controller: 'EmrequestLogFormCtrl'
			},
		}
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');
});
