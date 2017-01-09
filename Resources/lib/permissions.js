	exports.requestPermissions = function(_permissions, _callback) {
		if (Ti.Platform.osname != 'android') {
			_callback(true);
			return;
		}
		var permissions = (Array.isArray(_permissions) ? _permissions : [_permissions]).map(function(perm) {
			return (perm.match(/^android\.permission\./)) ? perm : 'android.permission.' + perm;
		});
		var grantedpermissions = 0;
		
		permissions.forEach(function(perm, i) {
			if (Ti.Android.hasPermission(perm))
				grantedpermissions++;
	
			if (grantedpermissions == permissions.length)
				_callback(true);
		});
		console.log("grantedpermissions="+grantedpermissions);
		if (grantedpermissions < permissions.length) {
			Ti.Android.requestPermissions(permissions, function(_e) {
				_callback(_e.success);
			});
		}
	};
