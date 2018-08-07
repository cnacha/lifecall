/* global angular, document, window */
'use strict';

var defaulturl = 'app.dashboard';
//var URL_PREFIX = 'http://localhost:8888';
var URL_PREFIX = 'https://lgserv-176108.appspot.com';

angular.module('starter.controllers', ['ionic'])

	.factory('methodFactory', function () {
		return {
			reset: function () {
				console.log("methodFactory - reset");
				window.localStorage.setItem('user', null);
			}
		}
	})


	.controller('AppCtrl', function ($scope, $rootScope, $ionicPopup, $ionicSideMenuDelegate, $ionicModal, $ionicLoading, $ionicPopover, $timeout, $state, $http,$filter, $cordovaCamera) {
		// Form data for the login modal
		$scope.loginData = {};
		$scope.isExpanded = false;
		$scope.hasHeaderFabLeft = false;
		$scope.hasHeaderFabRight = false;
		$ionicSideMenuDelegate.canDragContent(false);
		
		$scope.URL_PREFIX = URL_PREFIX;

		var navIcons = document.getElementsByClassName('ion-navicon');
		for (var i = 0; i < navIcons.length; i++) {
			navIcons.addEventListener('click', function () {
				this.classList.toggle('active');
			});
		}

		$rootScope.errorPopUp = function (show) {
			if (show === true) {
				$ionicPopup.alert({
					title: 'ไม่สำเร็จ',
					template: 'มีข้อผิดพลาดบางอย่าง! '
				});
			}
		}
		////////////////////////////////////////
		// Layout Methods
		////////////////////////////////////////

		$scope.hideNavBar = function () {
			document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
		};

		$scope.showNavBar = function () {
			document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
		};

		$scope.noHeader = function () {
			var content = document.getElementsByTagName('ion-content');
			for (var i = 0; i < content.length; i++) {
				if (content[i].classList.contains('has-header')) {
					content[i].classList.toggle('has-header');
				}
			}
		};

		$scope.setExpanded = function (bool) {
			$scope.isExpanded = bool;
		};

		$scope.setHeaderFab = function (location) {
			var hasHeaderFabLeft = false;
			var hasHeaderFabRight = false;

			switch (location) {
				case 'left':
					hasHeaderFabLeft = true;
					break;
				case 'right':
					hasHeaderFabRight = true;
					break;
			}

			$scope.hasHeaderFabLeft = hasHeaderFabLeft;
			$scope.hasHeaderFabRight = hasHeaderFabRight;
		};

		$scope.hasHeader = function () {
			var content = document.getElementsByTagName('ion-content');
			for (var i = 0; i < content.length; i++) {
				if (!content[i].classList.contains('has-header')) {
					content[i].classList.toggle('has-header');
				}
			}

		};
		
		$rootScope.phonecall = function (phonenumber) {
			console.log(phonenumber);
			var call = "tel:" + phonenumber;
			document.location.href = call;
		}

		$scope.hideHeader = function () {
			$scope.hideNavBar();
			$scope.noHeader();
		};

		$scope.showHeader = function () {
			$scope.showNavBar();
			$scope.hasHeader();
		};

		$scope.clearFabs = function () {
			var fabs = document.getElementsByClassName('button-fab');
			if (fabs.length && fabs.length > 1) {
				fabs[0].remove();
			}
		};
		
		$rootScope.statusTH = function(st){
			if(st == 'calling')
				return 'โทรเรียกฉุกเฉิน';
			if(st == 'responded')
				return 'ตอบรับการโทรเรียก';
			if(st == 'assigned')
				return 'รอศูนย์บริการฉุกเฉิน';
			if(st == 'pickingup')
				return 'กำลังเดินทางรับผู้ป่วย';
			if(st == 'atpatient')
				return 'รถพยาบาลถึงผู้ป่วยแล้ว';
			if(st == 'delivered')
				return 'ผู้ป่วยถึงโรงพยาบาล';
			if(st == 'closed')
				return 'ปิดคำขอบริการ';
		}
		
		$rootScope.formatTime = function(date){
			var dateObj = new Date(date);
			return $filter('date')(dateObj, 'HH:mm');
		}
		
		$rootScope.formatDate = function(date){
			var dateObj = new Date(date);
			return $filter('date')(dateObj, 'dd-MM-yyyy');
		}
		
		$rootScope.toMinute = function(second){
			return  Math.ceil(second / 60);
		}
		
		
		// take photo for image recognition
		$scope.takeImage = function () {
			console.log("takeImage called");
			var options = {
				quality: 80,
				destinationType: Camera.DestinationType.DATA_URL,
				//sourceType: Camera.PictureSourceType.CAMERA,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 800,
				targetHeight: 600,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};

			$cordovaCamera.getPicture(options).then(function (imageData) {
				console.log("getPicture called");
				$rootScope.imageData = imageData;
				$state.go("app.recordConsumption");

			}, function (err) {
				$ionicLoading.hide();
				$rootScope.errorPopUp(true);
			});
		}


		// On select emreqeust
		$scope.getEmRequestDetail = function (emreq) {
			console.log("show req:" +JSON.stringify(emreq.id));
			//$rootScope.emrequestid = emreq.id;
			$state.go('app.home',{id: emreq.id});
		};
		
		$rootScope.emrequests = {};
		
		$scope.listload = false;
		$rootScope.loadEmrequestData = function () {
			$scope.listload = true;
			console.log("loadEmrequestData called");
			$http.get(URL_PREFIX + "/api/emrequest/status/open/query.do")
				.success(function (data, status) {
					console.log("appctrl.loadEmrequestData ");
					console.log(data);
					$rootScope.emrequests = data;
					$scope.$broadcast('scroll.refreshComplete');
					$scope.listload = false;
				}).error(function (data, status) {
					console.log("errrorr.....");
					$scope.listload = false;
				//	$rootScope.errorPopUp(true);
				});
		}
		

		// Auto login
		var uObj = window.localStorage.getItem('user');
		console.log('LoginCtrl - Existing user: ' + uObj);
		if (uObj != 'null' && uObj != null) {
			console.log('this user alraldy login so go to homepage : authorizationKey = ' + JSON.parse(uObj).authorizationKey);
			$http.defaults.headers.common['___authorizationkey'] = JSON.parse(window.localStorage.getItem('user')).authorizationKey;
			$state.go(defaulturl);
			return;
		} else {
			$state.go('app.login');
		}
	
		
		

	})

	.controller('LoginCtrl', function ($scope, $rootScope, $state, $timeout, $ionicPush, $ionicSideMenuDelegate, $stateParams, ionicMaterialInk, $location, $http, $cordovaOauth, $ionicLoading, $ionicPopup) {
		$rootScope.showMenu = false;
		$ionicSideMenuDelegate.canDragContent(false);

		var uObj = window.localStorage.getItem('user');
		console.log('LoginCtrl - Existing user: ' + uObj);
		if (uObj != 'null' && uObj != null) {
			console.log('this user alraldy login so go to homepage : authorizationKey = ' + JSON.parse(uObj).authorizationKey);
			$http.defaults.headers.common['___authorizationkey'] = JSON.parse(window.localStorage.getItem('user')).authorizationKey;
			$state.go(defaulturl);
			return;
		}

		$scope.$parent.clearFabs();
		$timeout(function () {
			$scope.$parent.hideHeader();
		}, 0);
		//$ionicSideMenuDelegate.canDragContent(false);
		ionicMaterialInk.displayEffect();

		var uObj = window.localStorage.getItem('user');
		console.log('LoginCtrl - Existing user: ' + uObj);
		if (uObj != 'null' && uObj != null) {
			console.log('this user alraldy login so go to homepage : authorizationKey = ' + JSON.parse(uObj).authorizationKey);
			$http.defaults.headers.common['___authorizationkey'] = JSON.parse(window.localStorage.getItem('user')).authorizationKey;
			$state.go(defaulturl);
			return;
		}

		$scope.$parent.clearFabs();
		$timeout(function () {
			$scope.$parent.hideHeader();
		}, 0);
		//$ionicSideMenuDelegate.canDragContent(false);
		ionicMaterialInk.displayEffect();

		$scope.formData = {};
		$scope.ksmLogin = function () {
			$ionicLoading.show();
			var headers = {
				'Content-Type': 'application/json'
			};
			$scope.formData.appRole = "CallCenter";
			$http.post(URL_PREFIX + "/api/security/login.do", JSON.stringify($scope.formData), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					//console.log("xxx"+JSON.stringify(data));
					if (data != '') {
						window.localStorage.setItem('user', JSON.stringify(data));

						$http.get(URL_PREFIX + "/api/security/pushtoken/save.do?tokenKey=" +  $rootScope.tokenId + "&userId=" + data.id)
						.then(function (res) {
							console.log('Update Device Token for ' + data.id + ' success');
						}, function (err) {
							console.error('ERR', JSON.stringify(err));
						});

						$state.go(defaulturl);
						// set header for authorization key
						$http.defaults.headers.common['___authorizationkey'] = data.authorizationKey;
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Security Alert',
							template: 'Invalid Username/Password, Please try to login again'
						});

						alertPopup.then(function (res) {

						});
					}

				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});

		}

		$scope.ksmRegister = function () {
			$state.go("app.register");
		}

	})

	.controller("LogoutCtrl", function ($scope, $state,$http, $ionicLoading, methodFactory) {
		console.log("LogoutCtrl called");
		$ionicLoading.show();
		var uObj = JSON.parse(window.localStorage.getItem('user'));
		console.log("user: "+JSON.stringify(uObj));
		$http.get(URL_PREFIX + "/api/security/logout.do?username=" + uObj.username)
						.then(function (res) {
							$ionicLoading.hide();
							console.log('Successfully logout..');
							methodFactory.reset();
							$state.go('app.login');
						}, function (err) {
							console.error('ERR', JSON.stringify(err));
						});
		
	})

	.controller("EmrequestLogListCtrl", function ($scope, $state,$http,$stateParams, $ionicLoading, methodFactory, $rootScope) {
		console.log('emrequest id:' + $stateParams.requestid);
		
		$scope.$parent.showHeader();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.statusLogs = {};
		$ionicLoading.show();
		$scope.loadData = function(){
			$http.get(URL_PREFIX + "/api/emrequest/emrequeststatuslog/list.do?id=" + $stateParams.requestid)
					.success(function (data, status) {
						$scope.statusLogs = data;
						$scope.$broadcast('scroll.refreshComplete');
						$ionicLoading.hide();
						if($scope.statusLogs.length > 0){
							$rootScope.emrequest.status = $scope.statusLogs[0].status;
						}
					}).error(function (data, status) {
						console.log("error" + JSON.stringify(data));
						$ionicLoading.hide();
						$rootScope.errorPopUp(true);
					});
		}
		$scope.loadData();
		
		$scope.newEmrequestLog = function (dr) {
			$state.go('app.emrequestLogForm',{requestid: $stateParams.requestid,direction: dr});
		}
		
		

	})
	
	.controller("EmrequestLogFormCtrl", function ($scope, $state,$http,$stateParams, $ionicLoading, methodFactory, $rootScope,$ionicPopup ) {
		console.log('emrequest id:' + $stateParams.requestid+" "+$rootScope.emrequest.status+" "+$stateParams.direction);
		
		$scope.$parent.showHeader();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		
		$scope.log = {};
		$scope.log.emRequestId = $stateParams.requestid;
		
		$scope.submit = function(){
			$ionicLoading.show();
			console.log($scope.log);
			$http.post(URL_PREFIX + "/api/emrequeststatuslog/save.do", JSON.stringify($scope.log)).
				success(function (data, status) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: 'เสร็จสิ้น',
						template: 'บันทึกสถานะการบริการเสร็จสมบูรณ์'
					});
					alertPopup.then(function (res) {
						$rootScope.loadEmrequestData();
						$state.go('app.emrequestLogList',{requestid: $stateParams.requestid});
					});
					
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
			

		}
		
		$scope.back = function(){
			console.log($scope.log);
			$state.go('app.emrequestLogList',{requestid: $stateParams.requestid});
		}
		
		$ionicLoading.show();
		$http.get(URL_PREFIX + "/api/emrequest/status/"+$stateParams.direction+"/list.do?status=" + $rootScope.emrequest.status)
				.success(function (data, status) {
					console.log(data);
					$scope.statusList = data;
					$scope.log.status = data[0];
					$ionicLoading.hide();
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
	
	})

	.controller("EmcenterFormCtrl", function ($scope, $state, $ionicLoading,$ionicNavBarDelegate, methodFactory, $http, $ionicPopup) {
		console.log("EmcenterFormCtrl called");
		
		$ionicNavBarDelegate.showBackButton(true);
		
		$scope.renderMap = function(){
			console.log('currentLat ' + $scope.emLat + " currentLong " + $scope.emLong);
			$ionicLoading.show();
			var loadMap = function(){
				var myLatlng = new google.maps.LatLng($scope.emLat, $scope.emLong);
				var map = new google.maps.Map(document.getElementById('em-center-map'), {
					zoom: 12,
					center: myLatlng
				});
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					draggable: true,
					animation: (google.maps.Animation.BOUNCE)
				});

				var updateMarkerPosition = function () {
					myLatlng = new google.maps.LatLng($scope.emLat, $scope.emLong);
					marker.setPosition(myLatlng);
				}

				var onDrag = new google.maps.event.addListener(marker, 'dragend', function (event) {
					$scope.emLat = event.latLng.lat();
					$scope.emLong = event.latLng.lng();
					console.log('on draging we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
				});

				var onClick = new google.maps.event.addListener(map, 'click', function (event) {
					$scope.emLat = event.latLng.lat();
					$scope.emLong = event.latLng.lng();
					updateMarkerPosition();
					console.log('on clicking we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
				});
				$ionicLoading.hide();
			}
			
			setTimeout(function () {
				google.maps.event.addDomListener(window, 'load', loadMap());
			}, 50);
		}
		
		$scope.loadUsers = function(){
			if($scope.emcenter == null)
				return;
			$scope.drivers = [];
			$scope.callcenters = [];
			$ionicLoading.show();
			$http.get(URL_PREFIX + "/api/emcenter/emdriver/list.do?id=" + $scope.emcenter.id)
					.success(function (data, status) {
						$scope.drivers = data;
						$ionicLoading.hide();
					}).error(function (data, status) {
						console.log("error" + JSON.stringify(data));
						$ionicLoading.hide();
						$rootScope.errorPopUp(true);
					});
			$http.get(URL_PREFIX + "/api/emcenter/callcenter/list.do?id=" + $scope.emcenter.id)
					.success(function (data, status) {
						$scope.callcenters = data;
						$ionicLoading.hide();
					}).error(function (data, status) {
						console.log("error" + JSON.stringify(data));
						$ionicLoading.hide();
						$rootScope.errorPopUp(true);
					});
		}
		
		$scope.emcenter = {};

		if (window.localStorage.getItem('emcenter')) {
			$scope.emcenter = JSON.parse(window.localStorage.getItem('emcenter'));
		}
		
		$scope.loadUsers();
		
		// load location for map
		if ($scope.emcenter!=null && $scope.emcenter.locLat != undefined && $scope.emcenter.locLat!=0) {
			$scope.emLat = $scope.emcenter.locLat;
			$scope.emLong = $scope.emcenter.locLong;
			$scope.renderMap();
		} else {
			console.log("No location setted, getting current location...");
			var options = {maximumAge: 0, timeout: 10000, enableHighAccuracy:true};
			$ionicLoading.show({
				template: 'No location set, getting current location...',
				animation: 'fade-in',
				showBackdrop: true
			});

			navigator.geolocation.getCurrentPosition(function (pos) {
				$ionicLoading.hide();
				$scope.emLat = pos.coords.latitude;
				$scope.emLong = pos.coords.longitude;
				$scope.renderMap();
			}, function(error){
				$ionicLoading.hide();
				$scope.emLat = 19.9874;
				$scope.emLong = 99.8598;
				$scope.renderMap();
			},options);
			
		}
		

		
		$scope.createEmCenter = function (emcenter) {
			emcenter.locLat = $scope.emLat;
			emcenter.locLong = $scope.emLong;

			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});

			$http.post(URL_PREFIX + "/api/emcenter/save.do", JSON.stringify(emcenter)).
				success(function (data, status) {
					console.log(JSON.stringify(data));
					if (emcenter.id != null) {
						var alertPopup = $ionicPopup.alert({
							title: 'สำเร็จ',
							template: 'ข้อมูลศูนย์บริการฉุกเฉินได้ถูกเปลี่ยนแปลงแล้ว !'
						});
						alertPopup.then(function (res) {
							$state.go('app.emcenterList');
						});
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'สำเร็จ',
							template: 'ข้อมูลศูนย์บริการฉุกเฉินได้ถูกบันทึกแล้ว !'
						});
						alertPopup.then(function (res) {
							$state.go('app.emcenterList');
						});
					}

					$ionicLoading.hide();

				}).error(function (data, status) {
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
	})

	.controller("EmcenterListCtrl", function ($scope, $state, $ionicLoading, methodFactory, $http, $ionicPopup, $rootScope) {
		console.log("EmcenterListCtrl called");
		
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		$scope.$parent.setHeaderFab('right');
		
		
		window.localStorage.setItem('emcenter', null);
		
		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true
		});

		$scope.listStart = 0;
		$scope.listLength = 7;
		$scope.emcenters = [];
		$scope.loadData = function (listStart,listLength) {
			if(listStart == 0)
					$scope.emcenters = [];
			$http.get(URL_PREFIX + "/api/emcenter/datatable/list.do?start="+listStart+"&length="+listLength)
				.success(function (data, status) {
					console.log(data);
					$scope.emcenters = $scope.emcenters.concat(data.data);
					if($scope.emcenters.length == data.recordsFiltered )
						$scope.moredata = true;
					else 
						$scope.moredata = false;
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$ionicLoading.hide();
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.loadMoreData = function(){
			$scope.listStart += $scope.listLength;
			$scope.loadData($scope.listStart,$scope.listLength);
		}

		$scope.getEmCenterDetail = function (emcenter) {
			window.localStorage.setItem('emcenter', JSON.stringify(this.emcenter));
			$state.go('app.emcenterForm');
			return;
		}

		$scope.deleteEmCenter = function (emcenterId) {
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});
			$http.get(URL_PREFIX + "/api/emcenter/delete.do?id=" + emcenterId).
				success(function (data, status) {
					var alertPopup = $ionicPopup.alert({
						title: 'สำเร็จ',
						template: 'ข้อมูลศูนย์บริการฉุกเฉินได้ถูกลบแล้ว'
					});

					$ionicLoading.hide();

					alertPopup.then(function (res) {
						$state.go('app.emcenterList');
						$scope.loadData(0,$scope.listLength);
					});
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.sendEmail = function(item){
			$scope.formData ={};
			$scope.formData.email = "";
			 var myPopup = $ionicPopup.show({
				 template: 'Email <input type = "email" ng-model = "formData.email">',
				 title: 'ส่งข้อมูลทางอีเมล์',
				 scope: $scope,
				  buttons: [{
					text: 'Cancel',
					type: 'button-default',
					onTap: function(e) {
					 // e.preventDefault();
					}
				  }, {
					text: 'OK',
					type: 'button-positive',
					onTap: function(e) {
						console.log('Sending Email!');
						$ionicLoading.show();
						$http.get(URL_PREFIX+"/api/emcenter/send.do?id="+item.id+"&email="+$scope.formData.email).
							success(function(data, status, headers, config) 
							{
								$ionicLoading.hide();
								var alertPopup = $ionicPopup.alert({
									title: 'ส่งข้อมูลสำเร็จ',
									template: 'ข้อมูลศูนย์ได้ถูกส่งไปทางอีเมล์แล้ว'
								});
							}).
							error(function(data, status, headers, config) 
							{
								console.log("error: "+data);
								$ionicLoading.hide();
								var alertPopup = $ionicPopup.alert({
									title: 'ส่งข้อมูลไม่สำเร็จ',
									template: 'เกิดความผิดพลาดในการส่งอีเมล์'
								});
							});
					}
				  }]
			  });
		}

		$scope.showSearchPopup = function () {
			$scope.search = {};
			var searchPopup = $ionicPopup.show({
				template: '<input type="text" ng-model="search.searchKey">',
				title: 'ใส่คำค้นหา',
				subTitle: '(ค้นหาโดยชื่อของศูนย์บริการฉุกเฉิน)',
				scope: $scope,
				buttons: [
					{ text: 'ยกเลิก' },
					{
						text: '<b>ค้นหา</b>',
						type: 'button-positive',
						onTap: function (e) {
							if (!$scope.search.searchKey) {
								e.preventDefault();
							} else {
								return $scope.search.searchKey;
							}
						}
					}
				]
			});

			searchPopup.then(function (res) {
				if(res){
					$ionicLoading.show({
						content: 'Loading',
						animation: 'fade-in',
						showBackdrop: true
					});

					$http.get(URL_PREFIX + "/api/emcenter/query.do?keyword=" + res)
						.success(function (data, status) {
							$scope.emcenters = data;
							$scope.$broadcast('scroll.refreshComplete');
							$ionicLoading.hide();
						}).error(function (data, status) {
							$ionicLoading.hide();
							$rootScope.errorPopUp(true);
							console.log("error" + JSON.stringify(data));
						});
				}
			});
		};
		$scope.loadData(0,$scope.listLength);
	})

	.controller("PatientListCtrl", function ($scope, $state,$rootScope, $ionicLoading, $http, $ionicPopup) {

		$rootScope.showMenu = true;
		$scope.$parent.showHeader();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		
		// Reset patient data
		window.localStorage.setItem('patient', null);
		$scope.patients = {};


		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true
		});

		$scope.URL_PREFIX = URL_PREFIX;

		// Get detail
		$scope.getPatientDetail = function (patient) {
			window.localStorage.setItem('patient', JSON.stringify(this.patient));
			$state.go('app.patientForm');
			return;
		}

		// Read
		$scope.listStart = 0;
		$scope.listLength = 7;
		$scope.patients = [];
		$scope.loadData = function (listStart,listLength) {
			if(listStart == 0)
					$scope.patients = [];
			$http.get(URL_PREFIX + "/api/patient/datatable/list.do?start="+listStart+"&length="+listLength)
				.then(function (res) {
					console.log(res.data);
					$scope.patients = $scope.patients.concat(res.data.data);
					if($scope.patients.length == res.data.recordsFiltered )
						$scope.moredata = true;
					else 
						$scope.moredata = false;
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$ionicLoading.hide();
					console.log($scope.patients);
				}, function (err) {
					console.error('ERR', JSON.stringify(err));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});

		}
		$scope.loadMoreData = function(){
			$scope.listStart += $scope.listLength;
			$scope.loadData($scope.listStart,$scope.listLength);
		}


		// Delete
		$scope.deletePatient = function (patientId) {
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});
			$http.get(URL_PREFIX + "/api/patient/delete.do?id=" + patientId).
				success(function (data, status) {
					var alertPopup = $ionicPopup.alert({
						title: 'สำเร็จ',
						template: 'ข้อมูลของคนไข้ได้ถูกลบแล้ว'
					});
					$ionicLoading.hide();

					alertPopup.then(function (res) {
						$state.go('app.patientList');
						$scope.loadData(0,$scope.listLength);
					});
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.createEmrequest = function(item){
			
			var confirmPopup = $ionicPopup.confirm({
				 title: 'เรียกบริการฉุกเฉิน',
				 template: 'คุณต้องการเรียกบริการฉุกเฉินสำหรับคนไข้ '+item.firstname+' แน่ใจหรือไม่?'
			});

			confirmPopup.then(function(res) {
				 if(res) {
					 var requestData = {};
					requestData.patientId = item.id;
					$ionicLoading.show();
					$http.post(URL_PREFIX + "/api/emrequest/save.do", JSON.stringify(requestData)).
							success(function (data, status) {
								$ionicLoading.hide();
								$rootScope.loadEmrequestData();
							}).error(function (data, status) {
								console.log("error" + JSON.stringify(data));
								$ionicLoading.hide();
								$rootScope.errorPopUp(true);
							});
				}
			});
			
		}
		
		$scope.sendEmail = function(item){
			$scope.formData ={};
			$scope.formData.email = "";
			 var myPopup = $ionicPopup.show({
				 template: 'Email <input type = "email" ng-model = "formData.email">',
				 title: 'ส่งข้อมูลทางอีเมล์',
				 scope: $scope,
				  buttons: [{
					text: 'Cancel',
					type: 'button-default',
					onTap: function(e) {
					 // e.preventDefault();
					}
				  }, {
					text: 'OK',
					type: 'button-positive',
					onTap: function(e) {
						console.log('Sending Email!');
						$ionicLoading.show();
						$http.get(URL_PREFIX+"/api/patient/send.do?id="+item.id+"&email="+$scope.formData.email).
							success(function(data, status, headers, config) 
							{
								$ionicLoading.hide();
								var alertPopup = $ionicPopup.alert({
									title: 'ส่งข้อมูลสำเร็จ',
									template: 'ข้อมูลของคนไข้ได้ถูกส่งไปทางอีเมล์แล้ว'
								});
							}).
							error(function(data, status, headers, config) 
							{
								console.log("error: "+data);
								$ionicLoading.hide();
								var alertPopup = $ionicPopup.alert({
									title: 'ส่งข้อมูลไม่สำเร็จ',
									template: 'เกิดความผิดพลาดในการส่งอีเมล์'
								});
							});
					}
				  }]
			  });
		}

		$scope.showSearchPopup = function () {
			$scope.search = {};
			var searchPopup = $ionicPopup.show({
				template: '<input type="text" ng-model="search.searchKey">',
				title: 'ใส่คำค้นหา',
				subTitle: '(ค้นหาโดยชื่อของคนไข้)',
				scope: $scope,
				buttons: [
					{ text: 'ยกเลิก' },
					{
						text: '<b>ค้นหา</b>',
						type: 'button-positive',
						onTap: function (e) {
							if (!$scope.search.searchKey) {
								e.preventDefault();
							} else {
								return $scope.search.searchKey;
							}
						}
					}
				]
			});

			searchPopup.then(function (res) {
				if(res){
					$ionicLoading.show({
						content: 'Loading',
						animation: 'fade-in',
						showBackdrop: true
					});

					$http.get(URL_PREFIX + "/api/patient/query.do?keyword=" + res)
						.success(function (data, status) {
							$scope.patients = data;
							$scope.$broadcast('scroll.infiniteScrollComplete');
							$ionicLoading.hide();
						}).error(function (data, status) {
							console.log("error" + JSON.stringify(data));
							$ionicLoading.hide();
							$rootScope.errorPopUp(true);
						});
				}
			});
		};

		$scope.loadData(0,$scope.listLength);
	})

	.controller("PatientFormCtrl", function ($scope, $state, $ionicLoading,$cordovaDevice,$cordovaFile,$cordovaFileTransfer, $http, $cordovaCamera, $ionicPopup) {

		$scope.patient = {};
		$scope.loading = false;
		
		var userObj = JSON.parse(window.localStorage.getItem('user'));
		if (window.localStorage.getItem('patient') != 'null') {
			$scope.patient = JSON.parse(window.localStorage.getItem('patient'));
			$scope.patient.currentLong = 0;
			$scope.patient.currentLat = 0;
			console.log(window.localStorage.getItem('patient'));
			$scope.loading = true;
			$http.get(URL_PREFIX+"/api/patient/locationlog/list.do?id="+$scope.patient.id)
			.then(function(res){ 
				$scope.loading = false;
				var actualDistances = [];
				var warnDistances = [];
				$scope.prevPositions = [];
				if(res.data!=0){
					for(var i=0; i<res.data.length; i++){	
						warnDistances.push($scope.patient.warnDistance);
						actualDistances.push(res.data[i].distanceFromCenter);
						if(i!=0){
							$scope.prevPositions.push({lat: res.data[i].locLat, lng: res.data[i].locLong})
						}
					}
					$scope.patient.currentLat = res.data[0].locLat;
					$scope.patient.currentLong = res.data[0].locLong;
					$scope.patient.distanceFromCenter = res.data[0].distanceFromCenter;
				}
				$scope.data = [actualDistances,warnDistances]; 
				
				setTimeout(function() {google.maps.event.addDomListener(window, 'load', loadMap());},500);
			}, function(err) {
				console.error('ERR', JSON.stringify(err));
			}); 
		}

		
		
		var loadMap = function() {
			$scope.loading = true;
			console.log("inside google map dom listener");
			
			
			var myLatlng = new google.maps.LatLng(20.0465867, 99.8931125);
				var mapOptions = {
					center: myLatlng,
					zoom: 16
					
			};
			
			console.log("before render map ");
			var map = new google.maps.Map(document.getElementById("patient-map"), mapOptions);
			console.log("after render map ");
			
			var pImage = 'https://storage.googleapis.com/image-mobile/user_pointer.png';
			var hImage = 'https://storage.googleapis.com/image-mobile/home-pointer.png';
			var prevImage = 'https://storage.googleapis.com/image-mobile/user_prev_pointer.png';
			console.log(JSON.stringify($scope.patient));
			if($scope.patient.currentLat != 0 && $scope.patient.currentLong!=0){
				map.setCenter(new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong));
				var myLocation = new google.maps.Marker({
					position: new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong),
					map: map,
					icon: pImage,
					title: "คนไข้"
				});
				myLocation.setClickable(false);
			} else if($scope.patient.homeLat != 0 && $scope.patient.homeLong!=0){
				map.setCenter(new google.maps.LatLng($scope.patient.homeLat, $scope.patient.homeLong));
			}
			
			for(var i=0; i< $scope.prevPositions.length; i++){
				var prevLocation = new google.maps.Marker({
				position: new google.maps.LatLng($scope.prevPositions[i].lat, $scope.prevPositions[i].lng),
				map: map,
				icon: prevImage,
				title: "ประวัติตำแหน่ง"
			});
			}
			var homeLocation = new google.maps.Marker({
				position: new google.maps.LatLng($scope.patient.homeLat, $scope.patient.homeLong),
				map: map,
				icon: hImage,
				title: "บ้าน"
			});

			var updateMarkerPosition = function () {
				myLatlng = new google.maps.LatLng($scope.emLat, $scope.emLong);
				$scope.patient.homeLat = $scope.emLat;
				$scope.patient.homeLong = $scope.emLong;
				homeLocation.setPosition(myLatlng);
			}

			var onDrag = new google.maps.event.addListener(homeLocation, 'dragend', function (event) {
				$scope.emLat = event.latLng.lat();
				$scope.emLong = event.latLng.lng();
				console.log('on draging we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
			});

			var onClick = new google.maps.event.addListener(map, 'click', function (event) {
				$scope.emLat = event.latLng.lat();
				$scope.emLong = event.latLng.lng();
				updateMarkerPosition();
				console.log('on clicking we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
			});
			
			$scope.map = map;
			$scope.loading = false;
		
		};

		// Create or Update Patient
		$scope.createPatient = function (patient) {
			$scope.patient = this.patient;
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});
			var callService = function(){
				console.log("service calling "+JSON.stringify($scope.patient));
				$http.post(URL_PREFIX + "/api/patient/save.do", JSON.stringify($scope.patient)).
					success(function (data, status) {

						if ($scope.patient.id != null) {
							var alertPopup = $ionicPopup.alert({
								title: 'เสร็จสิ้น',
								template: 'เปลี่ยนแปลงข้อมูลคนไข้เรียบร้อยแล้ว !'
							});
							alertPopup.then(function (res) {
								$state.go('app.patientList');
							});
						} else {
							var alertPopup = $ionicPopup.alert({
								title: 'เสร็จสิ้น',
								template: 'เพิ่มข้อมูลคนไข้สำเร็จแล้ว!'
							});
							alertPopup.then(function (res) {
								$state.go('app.patientList');
							});
						}

						$ionicLoading.hide();

					}).error(function (data, status) {
						console.log("error" + JSON.stringify(data));
						$ionicLoading.hide();
						$rootScope.errorPopUp(true);
					});
			}
			console.log(JSON.stringify($scope.patient));
			if($scope.patient.id == undefined || $scope.patient.homeLat == 0){
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					"address": $scope.patient.address
				}, function(results) {
				//	console.log(results);
					if(results.length == 0){
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
								title: 'ผิดพลาด',
								template: 'ข้อมลที่อยู่ไม่ถูกต้อง!'
							});
							alertPopup.then(function (res) {
								return;
							});
					} else {
					/*	for(var i=0;i< results.length; i++){
							console.log(JSON.stringify(results[i]));
						}
					*/
						console.log(results[0].geometry.location.lat()); //LatLng
						$scope.patient.homeLat = results[0].geometry.location.lat();
						$scope.patient.homeLong = results[0].geometry.location.lng();
						callService();
					}
				});
			} else {
				callService();
			}
		}
		
		$scope.loadPatient = function(){
			$http.get(URL_PREFIX+"/api/patient/get.do?id="+$scope.patient.id)
			.then(function(res){ 
				$scope.patient = res.data;
			}, function(err) {
				console.error('ERR', JSON.stringify(err));
			});
			
		}
			
		$scope.uploadImage = function(){
			 $ionicLoading.show();
			   // Destination URL
			  var url = URL_PREFIX+"/api/patient/photo/upload.do?id="+$scope.patient.id;
			 
			  // File for Upload
			  var targetPath = $scope.pathForImage($scope.image);
			 
			  // File name only
			  var filename = $scope.image;
			  var params = new Object();
			  params.headers = {"___authorizationKey": userObj.authorizationKey, "Content-Type": "application/octet-stream"};
			  var options = {
				chunkedMode: false,
				mimeType: "image/jpg",
				params : params
			  };
			  
			 
			  $cordovaFileTransfer.upload(url, targetPath, options).then(function(result) {
				console.log("upload successfully...");
				$scope.loadPatient();
				$ionicLoading.hide();
			  });
		}
		
		
		$scope.pathForImage = function(image) {
		  if (image === null) {
			return '';
		  } else {
			return cordova.file.dataDirectory + image;
		  }
		};
	
		// take photo for profile
		$scope.takeImage = function() {
		  console.log("takeImage called");
			var options = {
				quality: 80,
				destinationType: Camera.DestinationType.FILE_URI,
				//sourceType: Camera.PictureSourceType.CAMERA,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 800,
				targetHeight: 600,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};

			$cordovaCamera.getPicture(options).then(function(imagePath) {
				console.log("getPicture called "+imagePath);
				 var currentName = imagePath.replace(/^.*[\\\/]/, '');
	 
				//Create a new name for the photo
				var d = new Date(),
				n = d.getTime(),
				newFileName =  n + ".jpg";
			 
				// If you are trying to load image from the gallery on Android we need special treatment!
				if ($cordovaDevice.getPlatform() == 'Android' ) {
					window.FilePath.resolveNativePath(imagePath, function(entry) {
					window.resolveLocalFileSystemURL(entry, success, fail);
					function fail(e) {
					  console.error('Error: ', e);
					}
			 
					function success(fileEntry) {
					  var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
					  // Only copy because of access rights
					  $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName).then(function(success){
					  $scope.image = newFileName;
					  $scope.uploadImage();
					  }, function(error){
						$scope.showAlert('Error', error.exception);
					  });
					};
				  }
				);
				} else {
				  var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
				  // Move the file to permanent storage
				  $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(function(success){
					$scope.image = newFileName;
					$scope.uploadImage();
				  }, function(error){
					$scope.showAlert('Error', error.exception);
				  });
				}
			 
			  
			}, function(err) {
				console.log(err);
				$ionicLoading.hide();
			});
		  }
			
	})	
	
	.controller("DistanceAlertListCtrl", function ($scope, $state,$rootScope, $ionicLoading, $http, $ionicPopup) {

		$scope.$parent.showHeader();
		$scope.isExpanded = false;
		$scope.hasHeaderFabRight = false;
		$scope.$parent.setExpanded(false);

		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true
		});

		// Get detail
		$scope.getPatientDetail = function (pObj) {
			window.localStorage.setItem('patient', JSON.stringify(pObj));
			console.log(pObj);
			$state.go('app.patientMap');
			return;
		}

		// Read
		$scope.alerts = [];
		$scope.loadData = function () {
			$http.get(URL_PREFIX + "/api/distancealert/list.do")
				.then(function (res) {
					console.log(res.data);
					$scope.alerts = res.data;
					$scope.countActive = 0;
					$scope.countInactive = 0;
					for(var i=0; i<$scope.alerts.length; i++){
						if($scope.alerts[i].status == '1')
							$scope.countActive +=1;
						else if($scope.alerts[i].status == '0')
							$scope.countInactive +=1;
					}
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide();
					//console.log(JSON.stringify($scope.alerts));
				}, function (err) {
					console.error('ERR', JSON.stringify(err));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});

		}
		
		// Delete
		$scope.deletePatient = function (id) {
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});
			$http.get(URL_PREFIX + "/api/distancealert/delete.do?id=" + id).
				success(function (data, status) {
					var alertPopup = $ionicPopup.alert({
						title: 'สำเร็จ',
						template: 'ข้อมูลของคนไข้ได้ถูกลบแล้ว'
					});
					$ionicLoading.hide();

					alertPopup.then(function (res) {
						$scope.loadData();
					});
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.toggleStatus = function(item){
			$ionicLoading.show();
			$http.post(URL_PREFIX + "/api/distancealert/status/toggle.do?id="+item.id).
				success(function (data, status) {
					$ionicLoading.hide();
					$scope.loadData();

				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}

		$scope.loadData();
	})

	.controller("PatientMapCtrl", function ($scope, $state, $ionicNavBarDelegate, $ionicLoading,$cordovaDevice,$cordovaFile,$cordovaFileTransfer, $http, $cordovaCamera, $ionicPopup) {
		$scope.$parent.showHeader();
		$scope.isExpanded = true;
		$scope.hasHeaderFabRight = false;
		$scope.$parent.setExpanded(true);
		$ionicNavBarDelegate.showBackButton(true);
		
		$scope.patient = {};
		$scope.loading = false;
		var userObj = JSON.parse(window.localStorage.getItem('user'));
		if (window.localStorage.getItem('patient') != 'null') {
			$scope.patient = JSON.parse(window.localStorage.getItem('patient'));
			console.log(window.localStorage.getItem('patient'));
			$scope.loading = true;
			$http.get(URL_PREFIX+"/api/patient/locationlog/list.do?id="+$scope.patient.id)
			.then(function(res){ 
				$scope.loading = false;
				var actualDistances = [];
				var warnDistances = [];
				$scope.prevPositions = [];
				if(res.data!=0){
					for(var i=0; i<res.data.length; i++){	
						warnDistances.push($scope.patient.warnDistance);
						actualDistances.push(res.data[i].distanceFromCenter);
						if(i!=0){
							$scope.prevPositions.push({lat: res.data[i].locLat, lng: res.data[i].locLong})
						}
					}
					$scope.patient.currentLat = res.data[0].locLat;
					$scope.patient.currentLong = res.data[0].locLong;
					$scope.patient.distanceFromCenter = res.data[0].distanceFromCenter;
				}
				$scope.data = [actualDistances,warnDistances]; 
				
				setTimeout(function() {google.maps.event.addDomListener(window, 'load', loadMap());},500);
			}, function(err) {
				console.error('ERR', JSON.stringify(err));
			}); 
		}

		
		
		var loadMap = function() {
			$scope.loading = true;
			console.log("inside google map dom listener");
			var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
	 
			var mapOptions = {
				center: myLatlng,
				zoom: 16
				
			};
			
			console.log("before render map ");
			var map = new google.maps.Map(document.getElementById("patient-map"), mapOptions);
			console.log("after render map ");
			
			var pImage = 'https://storage.googleapis.com/image-mobile/user_pointer.png';
			var hImage = 'https://storage.googleapis.com/image-mobile/home-pointer.png';
			var prevImage = 'https://storage.googleapis.com/image-mobile/user_prev_pointer.png';

			map.setCenter(new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong));
			var myLocation = new google.maps.Marker({
				position: new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong),
				map: map,
				icon: pImage,
				title: "คนไข้"
			});
			for(var i=0; i< $scope.prevPositions.length; i++){
				var prevLocation = new google.maps.Marker({
				position: new google.maps.LatLng($scope.prevPositions[i].lat, $scope.prevPositions[i].lng),
				map: map,
				icon: prevImage,
				title: "ประวัติตำแหน่ง"
			});
			}
			var homeLocation = new google.maps.Marker({
				position: new google.maps.LatLng($scope.patient.homeLat, $scope.patient.homeLong),
				map: map,
				icon: hImage,
				title: "บ้าน"
			});
			
			if($scope.patient.warnDistance != 0){
				var cityCircle = new google.maps.Circle({
					strokeColor: '#93bdec',
					strokeOpacity: 0.5,
					strokeWeight: 1,
					fillColor: '#93bdec',
					fillOpacity: 0.35,
					map: map,
					center: {lat: $scope.patient.homeLat, lng: $scope.patient.homeLong},
					radius: $scope.patient.warnDistance
				  });
			}
			
			$scope.map = map;
			$scope.loading = false;
		
		};

		$scope.loadPatient = function(){
			$http.get(URL_PREFIX+"/api/patient/get.do?id="+$scope.patient.id)
			.then(function(res){ 
				$scope.patient = res.data;
			}, function(err) {
				console.error('ERR', JSON.stringify(err));
			});
		}
	
			
	})

	.controller("CaregiverListCtrl", function ($scope, $state, $ionicLoading, methodFactory, $http, $ionicPopup) {
		console.log("CaregiverListCtrl called");
		
		$scope.$parent.showHeader();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);

		window.localStorage.setItem('caregiver', null);
		$scope.caregivers = {};
		

		$scope.getCareGiverDetail = function (caregiver) {
			window.localStorage.setItem('caregiver', JSON.stringify(this.caregiver));
			$state.go('app.caregiverForm');
			return;
		}

		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true
		});
		$scope.listStart = 0;
		$scope.listLength = 7;
		$scope.caregivers = [];
		$scope.loadData = function (listStart,listLength) {
			if(listStart == 0)
						$scope.caregivers = [];
			$http.get(URL_PREFIX + "/api/caregiver/datatable/list.do?start="+listStart+"&length="+listLength)
				.success(function (data, status) {
					console.log(data);
				
					$scope.caregivers = $scope.caregivers.concat(data.data);
					if($scope.caregivers.length == data.recordsFiltered )
						$scope.moredata = true;
					else 
						$scope.moredata = false;
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$ionicLoading.hide();
					console.log($scope.caregivers);
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		$scope.loadMoreData = function(){
			$scope.listStart += $scope.listLength;
			$scope.loadData($scope.listStart,$scope.listLength);
		}

		$scope.deleteCareGiver = function (caregiverId) {
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});

			$http.get(URL_PREFIX + "/api/caregiver/delete.do?id=" + caregiverId).
				success(function (data, status) {
					var alertPopup = $ionicPopup.alert({
						title: 'เสร็จสิ้น',
						template: 'ข้อมูลผู้ดูแลคนไข้ได้ถูกลบเรียบร้อยแล้ว !'
					});

					$ionicLoading.hide();

					alertPopup.then(function (res) {
						$state.go('app.caregiverList');
						$scope.loadData(0,$scope.listLength);
					});
				}).error(function (data, status) {
					$ionicLoading.hide();
					console.log("error" + JSON.stringify(data));
					$rootScope.errorPopUp(true);
				});
		}

		$scope.showSearchPopup = function () {
			$scope.search = {};
			console.log('showSearchPopup called');
			var searchPopup = $ionicPopup.show({
				
				template: '<input type="text" ng-model="search.searchKey">',
				title: 'ใส่คำค้นหา',
				subTitle: '(ค้นหาโดยชื่อของผู้ดูแลคนไข้)',
				scope: $scope,
				buttons: [
					{ text: 'ยกเลิก' },
					{
						text: '<b>ค้นหา</b>',
						type: 'button-positive',
						onTap: function (e) {
							
							if (!$scope.search.searchKey) {
								e.preventDefault();
							} else {
								return $scope.search.searchKey;
							}
						}
					}
				]
			});

			searchPopup.then(function (res) {
				if(res){
					$ionicLoading.show({
						content: 'Loading',
						animation: 'fade-in',
						showBackdrop: true
					});
					$http.get(URL_PREFIX + "/api/caregiver/query.do?keyword=" + res)
						.success(function (data, status) {
							$scope.caregivers = data;
							$scope.$broadcast('scroll.refreshComplete');
							$ionicLoading.hide();
						}).error(function (data, status) {
							console.log("error" + JSON.stringify(data));
							$ionicLoading.hide();
							$rootScope.errorPopUp(true);
						});
				}
			});
		};

		$scope.loadData(0,$scope.listLength);
	})

	.controller("CaregiverFormCtrl", function ($scope, $state, $ionicLoading, $http, $ionicPopup) {
		
		$scope.caregiver = {};
		if (window.localStorage.getItem('caregiver') != null) {
			$scope.caregiver = JSON.parse(window.localStorage.getItem('caregiver'));
		}
		console.log('CaregiverFormCtrl ');
		console.log($scope.caregiver);

		$scope.createCareGiver = function (caregiver) {
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true
			});

			$http.post(URL_PREFIX + "/api/caregiver/save.do", JSON.stringify(this.caregiver)).
				success(function (data, status) {

					if (caregiver.id != null) {
						var alertPopup = $ionicPopup.alert({
							title: 'เสร็จสิ้น',
							template: 'เปลี่ยนแปลงข้อมูลผู้ดูแลเรียบร้อยแล้ว !'
						});
						alertPopup.then(function (res) {
							$state.go('app.caregiverList');
						});
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'เสร็จสิ้น',
							template: 'เพิ่มข้อมูลผู้ดูแลสำเร็จแล้ว!'
						});
						alertPopup.then(function (res) {
							$state.go('app.caregiverList');
						});
					}

					$ionicLoading.hide();

				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.addPatient = function(){
			$scope.data = {};
			$scope.data.securityCode = "";
			var myPopup = $ionicPopup.show({
				 template: '<input type = "text" width="30" class="pretty-thai-text" ng-model = "data.securityCode">',
				 title: 'เพิ่มคนไข้ในการดูแล',
				 subTitle: 'โปรดระบุรหัส security code ของคนไข้',
				 scope: $scope,
					
				 buttons: [
					{ text: 'ยกเลิก' }, {
					   text: 'บันทึก',
					   type: 'button-positive',
					   onTap: function(e) {
						   console.log("input security code "+$scope.data.securityCode);
						  if ($scope.data.securityCode == "") {
							 e.preventDefault();
						  } else {
							 // find patient by security code
							$http.get(URL_PREFIX+"/api/patient/securityCode/query.do?code="+$scope.data.securityCode)
								.then(function(res){ 
									$ionicLoading.hide();
									console.log(JSON.stringify(res.data));
									if(res.data.length != 0){
										// save on location on server
										$ionicLoading.show();
										var headers = { 'Content-Type':'application/json' };
										var carepermit = { patientId: res.data[0].id, careGiverId: $scope.caregiver.id};
										$http.post(URL_PREFIX+"/api/carepermit/save.do",JSON.stringify(carepermit),headers).
											success(function(data, status, headers, config) 
											{
												$ionicLoading.hide();
												console.log("save result"+JSON.stringify(data));
												$scope.caregiver.patients.push(res.data[0]);
												
											}).
											error(function(data, status, headers, config) 
											{
												console.log("error"+JSON.stringify(data));
												$ionicLoading.hide();
												var alertPopup = $ionicPopup.alert({
													title: 'เพิ่มคนไข้ในความดูแล',
													template: 'เกิดความผิดพลาดในการเพิ่มคนไข้ในความดูแล'
												});
											});
									} else{
										var alertPopup = $ionicPopup.alert({
													title: 'เพิ่มคนไข้ในความดูแล',
													template: 'ไม่พบคนไข้ด้วยรหัส Security code นี้'
												});
										e.preventDefault();
									}
								}
								, function(err) {
										console.error('ERR', JSON.stringify(err));
										$ionicLoading.hide();
										e.preventDefault();
								}); 
						  }
					   }
					}
				 ]
			  });
		}
		
		$scope.removePatient = function(patientId,index){
			 var confirmPopup = $ionicPopup.confirm({
				 title: 'ลบคนไข้ในการดูแล',
				 template: 'คุณกำลังลบคนไข้ในการดูแล คุณแน่ใจหรือไม่?'
			  });

			  confirmPopup.then(function(res) {
				 if(res) {
					$ionicLoading.show();
					$http.get(URL_PREFIX+"/api/caregiver/patient/delete.do?careGiverId="+$scope.caregiver.id+"&patientId="+patientId)
							.then(function(res){ 
								$ionicLoading.hide();
								$scope.caregiver.patients.splice(index,1);
							}
							, function(err) {
									console.error('ERR', JSON.stringify(err));
									$ionicLoading.hide();
									e.preventDefault();
							}); 
				 } 
			  });
			
		}
	})

	.controller("EmrequestListCtrl", function ($scope, $state, $ionicLoading, methodFactory, $http, $ionicPopup, $rootScope) {
		console.log("EmrequestListCtrl called");
		
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab('right');
		
		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true
		});

		$scope.listStart = 0;
		$scope.listLength = 7;
		$scope.emrequests = [];
		$scope.loadData = function (listStart,listLength) {
			console.log("loadData "+listStart+","+listLength);
			if(listStart == 0)
					$scope.emrequests = [];
			$http.get(URL_PREFIX + "/api/emrequest/datatable/list.do?start="+listStart+"&length="+listLength)
				.success(function (data, status) {
					console.log(data);
					$scope.emrequests = $scope.emrequests.concat(data.data);
					if($scope.emrequests.length == data.recordsFiltered )
						$scope.moredata = true;
					else 
						$scope.moredata = false;
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$ionicLoading.hide();
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$rootScope.errorPopUp(true);
				});
		}
		
		$scope.loadMoreData = function(){
			$scope.listStart += $scope.listLength;
			$scope.loadData($scope.listStart,$scope.listLength);
		}
		
		$scope.getEmrequestLog = function (id) {
			$state.go('app.emrequestLogList',{requestid: id});
		}
		
		$scope.loadData(0,$scope.listLength);
	})
	
	.controller('DashboardCtrl', function ($scope, $rootScope, $window, $ionicHistory, $ionicNavBarDelegate, $ionicSideMenuDelegate, $stateParams, $ionicPopup, $http, $filter, $timeout, ionicMaterialMotion, $ionicLoading, ionicMaterialInk, $state) {
		$rootScope.showMenu = true;
		// Set Header
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		$scope.$parent.setHeaderFab(false);
		$ionicNavBarDelegate.showBackButton(false);
		$ionicSideMenuDelegate.canDragContent(true);
	/**	$timeout(function () {
			$scope.$parent.hideHeader();
		}, 0);**/
		$rootScope.loadEmrequestData();
		$ionicLoading.show();
		$http.get(URL_PREFIX + "/api/summary/entity/count.do")
				.success(function (data, status) {
					$scope.entityCounts = data;
				
					$http.get(URL_PREFIX + "/api/summary/emrequest/status/count.do")
							.success(function (data, status) {
								console.log(data);
								var keyNames = Object.keys(data);
								$scope.statusLabels = [];
								$scope.statusData = [];
								for (var i in data) {
									$scope.statusLabels.push($rootScope.statusTH(i));
									$scope.statusData.push(data[i]);
									console.log(i);
								}
								
								$http.get(URL_PREFIX + "/api/summary/emrequest/latest.do?number=3")
									.success(function (data, status) {
										console.log(data);
										$scope.latester = data;
										$ionicLoading.hide();
									}).error(function (data, status) {
										console.log("error" + JSON.stringify(data));
										$ionicLoading.hide();
										$rootScope.errorPopUp(true);
									});
							}).error(function (data, status) {
								console.log("error" + JSON.stringify(data));
								$ionicLoading.hide();
								$rootScope.errorPopUp(true);
							});
					
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
					$state.go("app.logout");
				});
		
		
	})
	
	.controller('ProfileCtrl', function ($scope, $rootScope, $window, $ionicHistory, $ionicNavBarDelegate, $ionicSideMenuDelegate, $stateParams, $ionicPopup, $http, $filter, $timeout, ionicMaterialMotion, $ionicLoading, ionicMaterialInk, $state) {
		$rootScope.showMenu = true;
		// Set Header
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab(false);
		$ionicNavBarDelegate.showBackButton(true);
		$ionicSideMenuDelegate.canDragContent(true);
		
		var userObj = JSON.parse(window.localStorage.getItem('user'));
		$scope.formData = {};
		$scope.formData.firstname = userObj.firstname;
		$scope.formData.lastname = userObj.lastname;
		$scope.formData.phone = userObj.phone;
		$scope.formData.email = userObj.email;
		$scope.saveData = function(){
			userObj.firstname = $scope.formData.firstname;
			userObj.lastname = $scope.formData.lastname;
			userObj.phone = $scope.formData.phone;
			userObj.email = $scope.formData.email;
			$ionicLoading.show();
			var headers = {'Content-Type': 'application/json'};
			$http.post(URL_PREFIX + "/api/user/save.do", JSON.stringify(userObj), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					window.localStorage.setItem('user',JSON.stringify(userObj));
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การแก้ไขข้อมูลสร็จสมบูรณ์ !'
						});
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
		}
		
		$scope.changePW = function(){
			if( $scope.formData.password != $scope.formData.repassword){
				var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: 'รหัสผ่านที่ใส่ไม่ตรงกัน '
						});
				return;
			}
			
			$ionicLoading.show();
			userObj.password = $scope.formData.password;
			var headers = {'Content-Type': 'application/json'};
			$http.post(URL_PREFIX + "/api/user/changePassword.do", JSON.stringify(userObj), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การแก้ไขรหัสผ่านเสร็จสมบูรณ์ !'
						});
					window.localStorage.setItem('user',JSON.stringify(userObj));
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
		}
		/**
		
		**/
	})
	
	.controller('HomeCtrl', function ($scope, $rootScope, $window, $ionicHistory, $ionicNavBarDelegate, $ionicPopover, $ionicSideMenuDelegate, $stateParams, $ionicPopup, $http, $filter, $timeout, ionicMaterialMotion, $ionicLoading, ionicMaterialInk, $state) {
		//$rootScope.emrequest = $rootScope.emrequests[$stateParams.showIndex];
		console.log('HomeCtrl '+$stateParams.id);
		
		$scope.loading = true;
		$rootScope.emrequest = null;
		$scope.emcenter = null;
		var userObj = JSON.parse(window.localStorage.getItem('user'));
		$http.get(URL_PREFIX + "/api/emrequest/get.do?id=" + $stateParams.id)
				.success(function (data, status) {
					$rootScope.emrequest = data;
					console.log($rootScope.emrequest);
					$scope.loadCaregiver();
					$scope.getPatientLocation();
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$rootScope.errorPopUp(true);
				});
					
		$rootScope.showMenu = true;
		// Set Header
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = false;
		$scope.$parent.setExpanded(false);
		$scope.$parent.setHeaderFab(false);
		$ionicNavBarDelegate.showBackButton(false);
		$ionicSideMenuDelegate.canDragContent(true);
		
		ionicMaterialInk.displayEffect();
	/**	$timeout(function () {
			$scope.$parent.hideHeader();
		}, 0);
		**/
		/**
		$ionicLoading.show({
			animation: 'fade-in',
			showBackdrop: true
		});
		**/
		
		$scope.getEmrequestLog = function (id) {
			$state.go('app.emrequestLogList',{requestid: id});
		}
		
		$scope.loadCaregiver = function(){
			$http.get(URL_PREFIX + "/api/caregiver/patient/list.do?id=" + $rootScope.emrequest.patient.id)
						.success(function (data, status) {
							console.log("caregiver list" + JSON.stringify(data));
							$rootScope.emrequest.patient.caregivers = data;
							
						}).error(function (data, status) {
							console.log("error" + JSON.stringify(data));
							$rootScope.errorPopUp(true);
						});
		}

		// Call list patient's location log https://lgserv-176108.appspot.com/api/patient/locationlog/list.do?id=1000001
		$scope.patientLocation = {};
		$scope.getPatientLocation = function () {
			console.log('Call getPatientLocation');
			$http.get(URL_PREFIX + "/api/patient/locationlog/list.do?id=" + $rootScope.emrequest.patient.id)
				.success(function (data, status) {
					if (data[0] != null) {
						$scope.patientLocation = data[0];
						$scope.listEmcenterNearbyPatientLocation($scope.patientLocation.locLat, $scope.patientLocation.locLong);
						$scope.$broadcast('scroll.refreshComplete');
					
					} else {

						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: 'ไม่พบตำแหน่งล่าสุดของคนไข้ !'
						});

					}
					
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$rootScope.errorPopUp(true);
				});
		}
		

		// Call list emcenter nearby patient location  https://lgserv-176108.appspot.com/api/emcenter/distance/query.do?lat=19.977759&long=99.868204
		$scope.emcentersNearby = {};
		
		$scope.listEmcenterNearbyPatientLocation = function (patientLat, patientLong) {
			$http.get(URL_PREFIX + "/api/emcenter/distance/query.do?lat=" + patientLat + "&long=" + patientLong)
				.success(function (data, status) {
					$scope.emcentersNearby = data;
					console.log($scope.emcentersNearby);
					$scope.$broadcast('scroll.refreshComplete');
					$scope.loadMap(patientLat, patientLong);
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$rootScope.errorPopUp(true);
				});
		}

		$scope.loadMap = function (patientLat, patientLong) {
			
			console.log("inside google map dom listener");
			var myLatlng = new google.maps.LatLng(patientLat, patientLong);

			var mapOptions = {
				center: myLatlng,
				zoom: 13,
				streetViewControl: false,
				mapTypeControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP
				
			};
			console.log("before render map ");
			var map = new google.maps.Map(document.getElementById("map"), mapOptions);
			console.log("after render map ");
			var image = 'https://storage.googleapis.com/image-mobile/user_pointer.png';

			

			map.setCenter(new google.maps.LatLng(patientLat, patientLong));
			var patientCurrentLocationMarker = new google.maps.Marker({
				position: new google.maps.LatLng(patientLat, patientLong),
				map: map,
				icon: image,
				title: "Patient Location"
			});
			if($rootScope.emrequest.status!='calling' && $rootScope.emrequest.status!='responded' &&  $rootScope.emrequest.emCenterId != null && $rootScope.emrequest.emCenterId !=''){
				for(var i=0; i<$scope.emcentersNearby.length; i++){
					if($rootScope.emrequest.emCenterId == $scope.emcentersNearby[i].id){
						var iconName = 'https://storage.googleapis.com/image-mobile/er-pointer.png';
						$scope.emcenter = $scope.emcentersNearby[i];
						var emCenterMarkers = new google.maps.Marker({
							position: new google.maps.LatLng($scope.emcenter.locLat, $scope.emcenter.locLong),
							map: map,
							icon: iconName,
							title: "Selected emergency center"
						});
					}
				}
				
			} else {
				angular.forEach($scope.emcentersNearby, function (value, index) {
					var iconName = 'https://storage.googleapis.com/image-mobile/place' + (index + 1) + '-pointer.png';
					var emCenterMarkers = new google.maps.Marker({
						position: new google.maps.LatLng(value.locLat, value.locLong),
						map: map,
						icon: iconName,
						title: "Nearby emergency centers"
					});
					 emCenterMarkers.addListener('click', function() {
					  var alertPopup = $ionicPopup.alert({
							title: 'Details',
							template: 'ศูนย์บริการฉุกเฉิน '+value.name,
						});
					});
				})
			}
				
			$scope.loading = false;
			$scope.map = map;
			$scope.checkCalling();
		};
		
		$scope.assignrequest = function(centerid,centername){
			$rootScope.emrequest.emCenterId = centerid;
			$rootScope.emrequest.emDriverId = 0;
			console.log("assigning to "+centername);
			$rootScope.emrequest.note = "ส่งงานบริการฉุกเฉินต่อให้  "+centername;
			$ionicLoading.show();
			var headers = {'Content-Type': 'application/json'};
			$http.post(URL_PREFIX + "/api/emrequest/assign.do", JSON.stringify($rootScope.emrequest), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การส่งงานเสร็จสมบูรณ์ !'
						});
					alertPopup.then(function (res) {
						$rootScope.loadEmrequestData();
						$scope.getEmrequestLog($rootScope.emrequest.id);
					});

				
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
		}

		$scope.checkCalling = function(){
			if($rootScope.emrequest.status == "calling"){
				var alertPopup = $ionicPopup.alert({
						title: 'รับงานบริการ',
						template: 'กดปุ่มด้านล่างเพิ่มตอบรับการเรียกบริการฉุกเฉิน'
					});
				alertPopup.then(function (res) {
					$ionicLoading.show();
					$http.get(URL_PREFIX + "/api/emrequest/status/respond.do?id=" + $rootScope.emrequest.id+"&user="+userObj.username )
						.success(function (data, status) {
							$rootScope.loadEmrequestData();
							$rootScope.emrequest.status = "responded";
							$rootScope.emrequest.callCenterUser = userObj.username;
							$ionicLoading.hide();
							
						}).error(function (data, status) {
							console.log("error" + JSON.stringify(data));
							$ionicLoading.hide();
							$rootScope.errorPopUp(true);
						});
					
				});
			}
		}
		
		
		
		$scope.careGiverPopover = $ionicPopover.fromTemplateUrl('templates/caregiverSelect.html', {
			scope: $rootScope,
			animation : 'ease-out'
		  }).then(function(popover) {
			$scope.careGiverPopover = popover;
		  });
	
		$scope.openCareGiverPopover = function($event){
			console.log($scope.careGiverPopover);  
			$scope.careGiverPopover.show($event);			  
		}
		
		$rootScope.closeCareGiverPopover = function() {
				$scope.careGiverPopover.hide();
			  };
		
		 $scope.editLocationDetails = function() {
			  $scope.data = {};
			
			  // Custom popup
			  var myPopup = $ionicPopup.show({
				 template: '<input type = "text" width="30" class="pretty-thai-text" ng-model = "data.locationDetails">',
				 title: 'ระบุตำแหน่ง',
				 subTitle: 'โปรดระบุตำแหน่งของคนไข้',
				 scope: $scope,
					
				 buttons: [
					{ text: 'ยกเลิก' }, {
					   text: 'บันทึก',
					   type: 'button-positive',
					   onTap: function(e) {
						   console.log("saveloc "+$scope.data.locationDetails);
						  if ($scope.data.locationDetails == "") {
							 e.preventDefault();
						  } else {
							// save on location on server
							
							$ionicLoading.show();
							$http.get(URL_PREFIX + "/api/emrequest/setloc.do?id=" + $rootScope.emrequest.id+"&location="+$scope.data.locationDetails )
								.success(function (data, status) {
									$rootScope.loadEmrequestData();
									$rootScope.emrequest.locationDetails = $scope.data.locationDetails;
									$ionicLoading.hide();
								}).error(function (data, status) {
									console.log("error" + JSON.stringify(data));
									$ionicLoading.hide();
									$rootScope.errorPopUp(true);
								});
						  }
					   }
					}
				 ]
			  });

			  myPopup.then(function(res) {
				 console.log('Tapped!', res);
			  });    
		   };

	})


	.directive('ionMultipleSelect', ['$ionicModal', '$ionicGesture', function ($ionicModal, $ionicGesture) {
		return {
			restrict: 'E',
			scope: {
				options: "=",
				coptions: "="
			},
			controller: function ($scope, $element, $attrs, $ionicLoading) {
				console.log("chbx:" + $attrs.renderCheckbox + $attrs.keyProperty);
				$scope.multipleSelect = {
					title: $attrs.title || "Select Options",
					tempOptions: [],
					keyProperty: $attrs.keyProperty || "id",
					valueProperty: $attrs.valueProperty || "value",
					selectedProperty: $attrs.selectedProperty || "selected",
					templateUrl: $attrs.templateUrl || 'templates/multipleSelect.html',
					renderCheckbox: $attrs.renderCheckbox ? $attrs.renderCheckbox == "true" : true,
					animation: $attrs.animation || 'none' //'slide-in-up'
				};
				$scope.OpenModalFromTemplate = function (templateUrl) {
					$ionicModal.fromTemplateUrl(templateUrl, {
						scope: $scope,
						animation: $scope.multipleSelect.animation
					}).then(function (modal) {
						$scope.modal = modal;
						$scope.modal.show();
					});
				};

				$ionicGesture.on('tap', function (e) {
					$ionicLoading.show();
					$scope.multipleSelect.tempOptions = $scope.options.map(function (option) {
						var tempOption = {};
						tempOption[$scope.multipleSelect.keyProperty] = option[$scope.multipleSelect.keyProperty];
						tempOption[$scope.multipleSelect.valueProperty] = option[$scope.multipleSelect.valueProperty];
						tempOption[$scope.multipleSelect.selectedProperty] = option[$scope.multipleSelect.selectedProperty];

						return tempOption;
					});
					$ionicLoading.hide();
					$scope.OpenModalFromTemplate($scope.multipleSelect.templateUrl);
				}, $element);

				$scope.saveOptions = function () {
					if ($scope.multipleSelect.renderCheckbox) {
						for (var i = 0; i < $scope.multipleSelect.tempOptions.length; i++) {
							var tempOption = $scope.multipleSelect.tempOptions[i];
							for (var j = 0; j < $scope.options.length; j++) {
								var option = $scope.options[j];
								if (tempOption[$scope.multipleSelect.keyProperty] == option[$scope.multipleSelect.keyProperty]) {
									option[$scope.multipleSelect.selectedProperty] = tempOption[$scope.multipleSelect.selectedProperty];
									break;
								}
							}
						}
					} else {
						// for radio button

						for (var i = 0; i < $scope.options.length; i++) {
							var option = $scope.options[i];
							if (option[$scope.multipleSelect.keyProperty] == $scope.selected) {
								option[$scope.multipleSelect.selectedProperty] = true;
							} else {
								option[$scope.multipleSelect.selectedProperty] = false;
							}
						}

					}
					$scope.closeModal();
				};

				$scope.onSelectRadio = function (u) {
					console.log("onSelectRadio called: " + u);
					$scope.selected = u;
				}

				$scope.closeModal = function () {
					$scope.modal.remove();
				};
				$scope.$on('$destroy', function () {
					if ($scope.modal) {
						$scope.modal.remove();
					}
				});
			}
		};
	}])

	;