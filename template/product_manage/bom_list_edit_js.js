var keyValue = request("keyValue");
var table = $("#materialsInfoTable");
var pro_name = request("pro_name");
var pro_id = request("pro_id");
var action = request("action");
var bootstrap = function ($, learun) {
    "use strict";
    var page = {
        init: function () {
            page.bind();
            page.initGird();
            page.initData();
        },
        bind: function () {
            new formValidate({
                formEle: '#signupForm'
            });

            $(".btn-default").addClass("btn-outline");


            $('#mul_id').select2().on('select2:select', function (event) {
                for (var i = 0; i < mul.length; i++) {
                    if (mul[i].mul_id == $(this).val()) {
                        $("[name='mul_rate']").val(mul[i].mul_rate);
                    }
                }

            });

            $('#sup_id').select2().on('select2:select', function (event) { });

            //添加物料
            $('#addMaterialsBtn').on('click', function () {
                Material.addMaterials();
            });
            //删除物料
            $('#delMaterialsBtn').on('click', function () {
                Material.delMaterials();
            });
            //添加工厂外购
            $('#addMaterialsByWG').on('click', function () {
                Material.addMaterialsByWG();
            });
        },
        initGird: function () {
            table.bootstrapTable({
                search: true,
                showRefresh: true,
                icons: {
                    refresh: "glyphicon-repeat",
                    columns: "glyphicon-list"
                },
                toolbar: '#toolbar',
                columns: [{
                    align: 'center',
                    checkbox: true
                }, {
                    field: 'pro_id',
                    title: '编号',
                    visible: false

                }, {
                    field: "pro_code",
                    title: "物料型号",
                    editable: {
                        type: 'text',
                        title: '物料型号',
                        emptytext: "物料型号"
                    }
                }, {
                    field: "pro_name",
                    title: "物料名称",
                    editable: {
                        type: 'text',
                        title: '物料名称',
                        emptytext: "物料名称"
                    }
                },
                {
                    field: "purchase_type",
                    title: "采购类型",
                    cellStyle: function (row, index) {
                        return { classes: 'purchase_type' }
                    },
                    formatter: function (value, row, index) {
                        if (value == undefined) {
                            value = "鼎骏自购";
                        }
                        return value;
                    }
                }, {
                    field: 'mat_specifications',
                    title: '规格',
                    visible: false
                }, {
                    field: 'unit',
                    title: '单位',
                    visible: false
                }, {
                    field: 'mat_weight',
                    title: '重量（g）',
                    visible: false
                }, {
                    title: '尺码',
                    field: 'pro_size',
                    visible: false
                }, {
                    title: '颜色',
                    field: 'pro_color',
                    visible: false
                }, {
                    field: 'storage_address',
                    title: '图片',
                    formatter: function (value, row, index) {
                        var str = '';
                        if (value != undefined) {
                            str += '<a href="' + top.$.rootUrl + row.storage_address + '" title="图片" data-gallery="" class="gallery-img"><img src="' + top.$.rootUrl + row.storage_address + '"></a>';
                        }
                        return str;
                    }
                }, {
                    title: '最近交易价格',
                    field: 'recent_transaction_price'
                },
                {
                    title: '采购价格',
                    field: 'purchase_price',
                    editable: {
                        type: 'text',
                        title: '采购价格',
                        emptytext: "采购价格",
                        validate: function (v) {
                            if (!v) return '采购价格不能为空';
                            //正则校验输入格式：最多两位小数。
                            var patrn = /^([1-9]\d*\.\d{1,2}|0\.\d[1-9]|[1-9]\d*)$/;
                            if (!patrn.test(v)) {
                                return '输入格式：最多两位小数';
                            }
                        },
                        success: function (response, newValue) {
                            priceChange($(this), newValue);
                        }
                    }
                },
                {
                    title: '数量',
                    field: 'quantity',
                    cellStyle: function (row, index) {
                        return { classes: 'quantity' }
                    },
                    editable: {
                        type: 'text',
                        title: '数量',
                        emptytext: "数量",
                        success: function (response, newValue) {
                            quantityChange($(this), newValue);
                        },
                        validate: function (v) {
                            if (!v) return '数量不能为空';
                            if (isNaN(v)) return '只允许输入数字';
                            var num = parseInt(v);
                            if (num <= 0) return '数量必须是正整数';
                        }
                    }
                },
                {
                    title: '金额',
                    field: 'amount',
                    cellStyle: function (row, index) {
                        return { classes: 'amount' }
                    },
                    formatter: function (value, row, index) {
                        if (row.mat_properties == '2' || row.purchase_price == undefined || row.quantity == undefined) {
                            工厂外购
                            value = 0;
                        } else {
                            value = row.purchase_price * row.quantity;
                        }
                        return value;
                    }
                },
                {
                    title: '备注',
                    field: 'remark',
                    editable: {
                        type: 'textarea',
                        emptytext: "备注",
                        title: '备注'
                    }
                }
                ],
                onSearch: function () {
                    sum();
                },
                onColumnSwitch: function (field, checked) {
                    sum();
                },
                onEditableSave: function (field, row, oldValue, $el) {
                    table.bootstrapTable('resetView');
                    table.bootstrapTable('updateRow', {
                        index: row.pro_id,
                        row: row
                    });
                    toggleDisabled();
                    sum();
                }
            });

        },
        initData: function () {
            if (action == "edit") {
                //编辑页面(加载数据)
                page.setData();
            } else if (action == "add") {
                //添加页面
                table.bootstrapTable('removeAll');
                page.initMultTpeSelect();
                $("[name='pro_name']").val(decodeURI(decodeURI(pro_name)));
                page.initsupplierSelect();
            }

        },
        setData: function () {
            $.ajax({
                url: top.$.rootUrl + "/ICE_ProductModule/ProductInfo/GetProductBomInfo?keyValue=" + keyValue,
                success: function (res) {
                    var resobj = $.parseJSON(res);
                    if (resobj.code == "200") {
                        var form = new liger.get("signupForm");
                        form.setData(resobj.data);
                        console.log(resobj.data);
                        pro_id = resobj.data.pro_id;
                        page.initMultTpeSelect(resobj.data.mul_id);
                        page.initsupplierSelect(resobj.data.sup_id);

                    }
                    else {
                        parent.layer.alert('获取数据失败！');
                    }
                }
            });

            //初始物料列表
            $.ajax({
                url: top.$.rootUrl + "/ICE_SupplierModule/SupplierInfo/GetSupplierBrandList?supplierID=" + keyValue,
                success: function (res) {
                    var resobj = $.parseJSON(res);
                    if (resobj.code == "200") {
                        console.log(resobj.data)
                        brandsTable.bootstrapTable('load', resobj.data);
                        sum();
                    } else {
                        parent.layer.alert('获取数据失败！');
                    }
                }
            });

        },
        initMultTpeSelect: function (mul_id) {
            learun.httpAsync('GET', top.$.rootUrl + '/ICE_FinancialModule/Multicurrency/GetMulticurrency', {}, function (data) {
                if (!!data && data.length > 0) {
                    mul = data;
                    $("#mul_id").append("<option value=\"\">请选择</option>");
                    for (var i = 0; i < data.length; i++) {
                        $("#mul_id").append("<option value=" + data[i].mul_id + ">" + data[i].mul_type + "</option>");
                    }
                    if (!!mul_id) {
                        $("#mul_id").select2().val(mul_id).trigger("change");
                        for (var i = 0; i < mul.length; i++) {
                            if (mul[i].mul_id == mul_id) {
                                $("[name='mul_rate']").val(mul[i].mul_rate);
                            }
                        }
                    }
                }
            });
        },
        initsupplierSelect: function (sup_id) {
            learun.httpAsync('GET', top.$.rootUrl + '/ICE_SupplierModule/SupplierInfo/GetSupplierListByProID', { pro_id: pro_id }, function (data) {
                if (!!data && data.length > 0) {
                    $("#sup_id").append("<option value=\"\">请选择</option>");
                    for (var i = 0; i < data.length; i++) {
                        $("#sup_id").append("<option value=" + data[i].sup_id + ">" + data[i].sup_name + "</option>");
                    }
                    if (!!sup_id) {
                        $("#sup_id").select2().val(sup_id).trigger("change");
                    }
                }
            });
        },
    };
    page.init();
}

var Material = {
    addMaterials: function () {
        var sup_id = $("#sup_id").select2().val();
        if (!!sup_id) {
            layer.open({
                type: 2,
                maxmin: true,
                close: true,
                title: "添加物料",
                area: ['80%', '80%'],
                maxmin: true,
                content: top.$.rootUrl + '/ICE_CommonModule/Common/MaterieAddBySupID?sup_id=' + sup_id
            });
        }
        else {
            parent.layer.alert('请选择供应商！');
        }

    },
    delMaterials: function () {
        var selects = table.bootstrapTable('getSelections');
        if (selects.length >= 1) {
            parent.layer.confirm('确定要删除该数据吗？', {
                btn: ['确定', '取消'],
                yes: function (index) {
                    pro_id = $.map(selects, function (row) {
                        return row.pro_id;
                    });
                    table.bootstrapTable('remove', {
                        field: 'pro_id',
                        values: pro_id
                    });
                    parent.layer.close(index);
                }
            });
        } else {
            parent.layer.alert('请选择要删除的行！');
        }
    },
    refreshMaterialsTable: function (MaterialsSelectData) {
        var MaterialsData = table.bootstrapTable('getData');
        var UniqueMaterialsData = arrayUnique(MaterialsData.concat(MaterialsSelectData), "pro_id");
        table.bootstrapTable('load', UniqueMaterialsData);
        toggleDisabled();
    },
    addMaterialsByWG: function () {
        var sup_id = $("#sup_id").select2().val();
        if (sup_id == undefined || sup_id == "") {
            alert('请选择供应商！');
            return;
        }
        var data = { pro_code: '', pro_name: '', purchase_type: '工厂外购', recent_transaction_price: 0, purchase_price: '', quantity: '', amount: 0, remark: '' };
        table.bootstrapTable('append', data);
        toggleDisabled();
        sum();
    }
}

function toggleDisabled() {
    $("tr").each(function () {
        var purchase_type = $(this).find(".purchase_type").text();
        if (purchase_type == "鼎骏自购") {
            $(this).find("td").eq(1).find('a[data-name= pro_code]').editable('toggleDisabled');
            $(this).find("td").eq(2).find('a[data-name= pro_name]').editable('toggleDisabled');
        }
    })
}

function submitForm() {
    var form = liger.get("signupForm");
    if (!form.valid()) {
        return;
    }
    $('.quantity a').editable('option', 'validate', function (v) {
        if (v == 0) return '请输入数量至少1件以上！';
    });
    var data = {};
    $("input,select,textarea").each(function () {
        var name = $(this).attr("name");
        if (name && name.indexOf('ligerui') == -1) {
            data[name] = this.value;
        }
    });
    data.pro_id = pro_id;
    data.sup_id = $('#sup_id').select2().val();//供应商   
    data.mul_id = $('#mul_id').select2().val();

    console.log(JSON.stringify(data));
    console.log(table.bootstrapTable('getData'));
    $.ajax({
        type: 'post',
        url: top.$.rootUrl + '/ICE_ProductModule/ProductInfo/SaveBomInfo',
        data: {
            keyValue: keyValue,
            BomInfo: data,
            Bomslist: table.bootstrapTable('getData'),
        },
        success: function (res) {
            var resobj = $.parseJSON(res);
            if (resobj.code == "200") {
                parent.productInfoTable.bootstrapTable('refresh');
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            } else {
                parent.layer.alert('保存失败！');
            }
        }
    });
}

//数组去重
function arrayUnique(arr, name) {
    var hash = {};
    return arr.reduce(function (item, next) {
        hash[next[name]] ? '' : hash[next[name]] = true && item.push(next);
        return item;
    }, []);
}

function priceChange(obj, price) {
    //获取单价的值
    var price = price;
    //获取数量的值
    var quantity = $(obj).closest('td').next().find('a').text();
    var amount;
    if (price != "") {
        if (quantity != "") {
            amount = parseFloat(price * quantity);
            //金额
            $(obj).closest('td').next().next().text(amount);
        }
    }
}

function quantityChange(obj, quantity) {
    //获取单价的值
    var purchase_price = $(obj).closest('td').prev().find('a').text();
    //获取数量的值
    var quantity = quantity;
    if (purchase_price != "") {
        if (quantity != "") {
            var total_price = parseFloat(quantity * purchase_price);
            //分摊前金额
            $(obj).closest('td').next().text(total_price);
        }
    }
}

function sum() {
    var sumQuantity = 0;
    var sumAmount = 0;
    var sumAmountAfter = 0;
    $("#materialsInfoTable td[class='quantity']").each(function () {
        sumQuantity += +$(this).find('a').text();
    });
    $("#materialsInfoTable td[class='amount']").each(function () {
        sumAmount += +$(this).text();
    });
    //先删除最后一行
    if ($("#materialsInfoTable tr").hasClass('footer')) {
        $("#materialsInfoTable tr:last").remove();
    }

    var columns = $('table thead tr').find('th').size();
    var nextColumns = $('table thead tr').find('th[data-field=quantity]').nextAll().size();
    var colspan = parseInt(columns - nextColumns - 1);
    var tr = '<tr class="footer"><td class="text-right" colspan="' + colspan + '">合计：</td><td class="total_count">' + sumQuantity + '</td><td class="total_price" colspan="' + nextColumns + '">' + sumAmount + '元</td></tr>';
    $('#materialsInfoTable').append(tr);
}



