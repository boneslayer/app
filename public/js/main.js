var bucketName = 'video-creator-dev-uploads';
var bucketRegion = 'us-west-2';
var IdentityPoolId = 'us-west-2:8d9129c5-93cb-4893-858d-b74405c5aae2';
var RoleArn = 'arn:aws:iam::344875100545:role/Cognito_uploadTestUnauth_Role';

var bucketUrl = 'https://' + encodeURIComponent(bucketName) + '.s3.amazonaws.com' + '/';
var bucketSubDir = 'binagorapp/';

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      RoleArn: RoleArn,
      IdentityPoolId: IdentityPoolId
    })
  });
  
  AWS.config.credentials.getPromise();
  
  var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: bucketName}
  });
  
var app = angular.module('binagorAPP', ['ngFileUpload','ngRoute','oc.lazyLoad']);
app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
        .when("/", {
            templateUrl : "views/login.html",
            controller: 'LoginCtrl'
        })
        .when("/createVideo", {
            templateUrl : "views/createVideo.html",
        })
        // .otherwise('/');
        $locationProvider.html5Mode(true);
}]);
app.controller('MainCtrl', ['$route', '$routeParams', '$location',
  function MainCtrl($route, $routeParams, $location) {
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
}]);

app.controller('UploadCtrl',['$scope','Upload', function ($scope,Upload) {
    var vm = this;
    vm.createButtonDisabled = true;
    
    vm.listFiles = function(bucketSubDir) {
        s3.listObjects({Prefix: bucketSubDir}, function(err, data) {
            if (err) {
                return alert('There was an error listing uploades files: ' + err.message);
            }
            var files = data.Contents.filter(file => file.Key.split(bucketSubDir)[1] != 'config.json').map(file => file.Key = file.Key.split(bucketSubDir)[1]);
            callback(files);
        });
        var callback = function(data){
            vm.uploads = data;
            vm.createButtonDisabled = false;
            $scope.$digest();
            console.log(vm.uploads);
        }
    }

    vm.upload = function(file) {
        s3.upload({
            Key: bucketSubDir+file.name,
            Body: file,
            // ACL: 'public-read'
          }, function(err, data) {
            if (err) {
              return alert('There was an error uploading your file: ', err.message);
            }
            console.log('Successfully uploaded photo.');
            vm.listFiles(bucketSubDir);
          });
    };
    
    vm.createVideo = function(){
        const data = {
            jobId: bucketSubDir.substr(0,bucketSubDir.length-1), // Some unique string id generator, should be the same as the containing folder INPUT_MEDIA_BUCKET/2211493e-5dbb-42b9-aa86-82ce58f033e8/every.file, a uuid works but could be anything
            audio: '',
            images: []
        };
        vm.uploads.map((fileName) => {
            if (fileName.split('.').pop() == 'mp3'){
                console.log('audio');
                data.audio = fileName;
            }else if (fileName.split('.').pop() == 'jpg'){
                console.log('imagen');
                data.images.push(fileName);
            }
        });
        console.log(data);

        if (data.audio == ''){
            return alert('audio file missing');
        }else if (Object.keys(data.images).length === 0){
            return alert('image files missing')
        }else {
            s3.upload({
                Key: bucketSubDir+'config.json',
                Body: JSON.stringify(data),
                // ACL: 'public-read'
              }, function(err, data) {
                if (err) {
                  return alert('There was an error uploading your file: ', err.message);
                }
                console.log('Successfully uploaded config.json.');
                
              });
        }
    };
    
    vm.listFiles(bucketSubDir);
}]);


app.controller("LoginCtrl", function($ocLazyLoad) {
    $ocLazyLoad.load('js/login.js');
    // $ocLazyLoad.load('css/login.css');
    // $ocLazyLoad.load('css/form-elements.css');

  });


