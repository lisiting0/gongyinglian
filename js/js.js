/* 服务请求end*/
//获取url中的参数
;
(function($) {
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null)
			return decodeURI(r[2]);
		return null;
	};
})(jQuery);

//将表单设置成查看的样式
;
(function() {
	setFormSee = function(opts) {
		$(opts.formEle).find('input[type="text"]').css({
			'border': 'none'
		}).prop('disabled', 'disabled');
	}
	
	$('.disabled-text').css({
		'border': 'none'
	}).prop('disabled', 'disabled');

})();

//表单验证
;
(function() {
	formValidate = function(opts) {
		this.formEle = $(opts.formEle);
		this.init();
	}
	formValidate.prototype.init = function() {
		$.metadata.setType("attr", "validate");
		var v = this.formEle.validate({
			errorPlacement: function(lable, element) {
				element.ligerHideTip();
				if(element.hasClass("l-textarea")) {
					element.ligerTip({
						content: lable.html(),
						target: element[0]
					});
				} else if(element.hasClass("l-text-field")) {
					element.parent().ligerTip({
						content: lable.html(),
						target: element[0]
					});
				} else if(element.hasClass("l-text-combobox")) {
					element.parent().ligerTip({
						content: lable.html(),
						target: element[0]
					});
				} else {
					lable.appendTo(element.parents("td:first"));
				}
			},
			success: function(lable) {
				lable.ligerHideTip();
				lable.remove();
			},
			submitHandler: function() {
				$("form .l-text,.l-textarea").ligerHideTip();
			}
		});
		this.formEle.ligerForm({
			inputWidth: '',
			validate: true
		});
	}
})();

function mergeObj(obj, source) {
	var json = obj || {};
	for(n in source) {
		json[n] = source[n];
	}
	return json;
}

window.USER_INFO = {
	SITE_URL: 'http://119.29.252.75'
}

//合并单元格
function mergeCells(data, fieldName, newindex, target) {
	//声明一个map计算相同属性值在data对象出现的次数和
	var sortMap = {};
	for(var i = 0; i < data.length; i++) {
		for(var prop in data[i]) {
			if(prop == fieldName) {
				var key = data[i][prop]
				if(sortMap.hasOwnProperty(key)) {
					sortMap[key] = sortMap[key] * 1 + 1;
				} else {
					sortMap[key] = 1;
				}
				break;
			}
		}
	}
	for(var prop in sortMap) {
		console.log(prop, sortMap[prop])
	}
	var index = 0;
	for(var prop in sortMap) {
		var count = sortMap[prop] * 1;
		$(target).bootstrapTable('mergeCells', {
			index: newindex != null ? newindex : index,
			field: fieldName,
			rowspan: count
		});
		if(newindex == null) {
			index += count;
		}
	}
}

function cancelLayer() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
}

function printOrder() {
	$(".button-group").addClass("display-none");
	$("textarea").each(function() {
		var value = $(this).val();
		$(this).parent().text(value);
		$(this).remove();
	});
	window.print();
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
}

function showCurrentDate() {
	var myDate = new Date;
	var str = "" + myDate.getFullYear() + "-";
	if(myDate.getMonth() < 10) {
		str += '0' + (myDate.getMonth() + 1) + "-";
	} else {
		str += (myDate.getMonth() + 1) + "-";
	}
	if(myDate.getDate() < 10) {
		str += '0' + myDate.getDate();
	} else {
		str += myDate.getDate();
	}
	return str;
}