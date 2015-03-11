window.onbeforeunload = function() {
	var ds = Ext.getCmp('orderDetailGrid').getStore();
	if (ds.getModifiedRecords().length != 0 || ds.removed.length != 0) {
		if (Ext.isIE) {
			if (document.body.clientWidth - event.clientX < 170
					&& event.clientY < 0 || event.altKey) {
				return "Order Details data has changed, you sure do not save?";
			} else if (event.clientY > document.body.clientHeight
					|| event.altKey) { // 用户点击任务栏，右键关闭
				return "Order Details data has changed, you sure do not save?";
			} else { // 其他情况为刷新
			}
		} else if (Ext.isChrome || Ext.isOpera) {
			return "Order Details data has changed, you sure do not save?";
		} else if (Ext.isGecko) {
			window.open("http://www.g.cn")
			var o = window.open("index.do?method=logoutAction");
		}
	}
}

var checkColumn = null;
// 窗口关闭触发事件
window.onunload = function() {
	cotOrderService.clearMap("order", function(res) {
			});
}

// 获取报价和订单的单价要保留几位小数
var facNum = getDeNum("facPrecision");
var outNum = getDeNum("outPrecision");
var deNum = getDeNum("orderPricePrecision");
// cbm保留几位小数
var cbmNum = getDeNum("cbmPrecision");
// 根据小数位生成"0.000"字符串
var facNumTemp = getDeStr(facNum);
var strNum = getDeStr(deNum);
var cbmStr = getDeStr(cbmNum);

Ext.onReady(function() {

	// 用于根据模版添加不存在样品时(newEleAdd.js)
	this.parentType = 'order';

	DWREngine.setAsync(false);
	var facData;
	var curData;
	var typeData;
	var orderMap;
	var nationMap;
	var cityMap;

	baseDataUtil.getBaseDicDataMap("CotNation", "id", "nationName", function(
					res) {
				nationMap = res;
			});
	baseDataUtil.getBaseDicDataMap("CotNationCity", "id", "cityName", function(
					res) {
				cityMap = res;
			});
	// 加载厂家表缓存
	baseDataUtil.getBaseDicDataMap("CotFactory", "id", "shortName", function(
					res) {
				facData = res;
			});
	DWREngine.setAsync(true);
	DWREngine.setAsync(false);
	// 加载币种表缓存
	baseDataUtil.getBaseDicDataMap("CotCurrency", "id", "curNameEn", function(
					res) {
				curData = res;
			});
	// 加载模块列
	cotCustomizeService.getCotCustomizeFieldMap('CotOrderDetail', function(rs) {
				orderMap = rs;
			});
	DWREngine.setAsync(true);
	DWREngine.setAsync(false);
	// 加载材质表缓存
	baseDataUtil.getBaseDicDataMap("CotTypeLv1", "id", "typeName",
			function(res) {
				typeData = res;
			});

	DWREngine.setAsync(true);
	// -----------------下拉框-----------------------------------------
	// 联系人
	var contactBox = new BindCombox({
				cmpId : 'contactId',
				mode : 'local',
				dataUrl : "servlet/DataSelvert?tbname=CotCustContact",
				emptyText : 'Choose',
				fieldLabel : "Contact",
				displayField : "contactPerson",
				valueField : "id",
				sendMethod : "post",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 6
			});

	// 客户名称
	var custBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotCustomer&key=customerShortName",
		cmpId : 'custId',
		fieldLabel : "<font color=red>Customer</font>",
		editable : true,
		valueField : "id",
		displayField : "customerShortName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		allowBlank : false,
		blankText : "Please choose customers!",
		tabIndex : 1,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all',
		listeners : {
			"select" : function(com, rec, index) {
				if (rec.data.id != '') {
					setCustomerForm(rec.data.id);
					contactBox.reset();
					contactBox.loadValueById('CotCustContact', 'customerId',
							rec.data.id);
				}
				var custId = custBox.getValue();
				if (!Ext.isEmpty(custId)) {
					cotCustomerService.getCustomerById(custId, function(res) {
						var city = '';
						var nation = '';
						var fullName = '';
						var adr = '';
						var post='';
						if (res != null) {
							if (!Ext.isEmpty(res.fullNameEn)) {
								fullName = res.fullNameEn + ',\n'
							}
							if (!Ext.isEmpty(res.customerAddrEn)) {
								adr = res.customerAddrEn + ',\n'
							}
							if(!Ext.isEmpty(res.customerPost)){
								post= res.customerPost+','
							}
							if (!Ext.isEmpty(cityMap[res.cityId])) {
								city = cityMap[res.cityId] + ',\n'
							}
							if (!Ext.isEmpty(nationMap[res.nationId])) {
								nation = nationMap[res.nationId];
							}
							var str = fullName + adr + post+city + nation;
							var start = str.indexOf(',');
							var end = str.lastIndexOf(',');
							var strLength=str.length-2;
							if (start == end) {
								if(start==strLength){
										str=str.substring(0,strLength);
									}
							} else {
								str = str.substring(0, end);
							}
							Ext.getCmp('buyer').setValue(str);
							txtAreaAry.buyer = str;
							Ext.getCmp("shippingMark").setValue(res.customerMb);
//							Ext.getCmp('seller').setValue('Wolly & Co,\n'
//									+ 'Hovedgaden 2,\n' + '4330 Hvalsø,\n'
//									+ 'Denmark');
							txtAreaAry.seller = 'Wolly & Co,\n'
									+ 'Hovedgaden 2,\n' + '4330 Hvalsø,\n'
									+ 'Denmark';
							txtAreaAry.shippingMark = res.customerMb;
						}
					});
				}
			}
		}
	});

	// 出口公司
	var companyBox = new BindCombox({
				dataUrl : "servlet/DataSelvert?tbname=CotCompany&key=companyShortName",
				cmpId : 'companyId',
				fieldLabel : "Company",
				editable : true,
				valueField : "id",
				displayField : "companyShortName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				allowBlank : true,
				tabIndex : 5,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 业务员
	var empBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotEmps&key=empsName&flag=filter",
		cmpId : 'bussinessPerson',
		fieldLabel : "<font color=red>Sale</font>",
		editable : true,
		valueField : "id",
		displayField : "empsName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		allowBlank : false,
		blankText : "Please choose Sale!",
		tabIndex : 4,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all'
	});

	// 创建人
	var addEmpBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotEmps&key=empsName&flag=filter",
		cmpId : 'addPerson',
		fieldLabel : "Add Person",
		editable : true,
		disabled : true,
		disabledClass : 'combo-disabled',
		valueField : "id",
		displayField : "empsName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		allowBlank : false,
		blankText : "Please choose add person!",
		tabIndex : 23,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all'
	});

	// 修改人
	var modEmpBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotEmps&key=empsName&flag=filter",
		cmpId : 'modPerson',
		fieldLabel : "Revise Person",
		editable : true,
		valueField : "id",
		displayField : "empsName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		allowBlank : false,
		disabled : true,
		disabledClass : 'combo-disabled',
		blankText : "Please choose modify person!",
		tabIndex : 24,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all'
	});

	// 审核人
	var empChkBox = new BindCombox({
				dataUrl : "servlet/DataSelvert?tbname=CotEmps&key=empsName",
				cmpId : 'checkPerson',
				fieldLabel : "Approve Person",
				disabled : true,
				disabledClass : 'combo-disabled',
				valueField : "id",
				displayField : "empsName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				tabIndex : 4,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 审核人
	var empShenBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotEmps&key=empsName&typeName=shenFlag&type=1&logId="
				+ logId,
		cmpId : 'shenPerson',
		fieldLabel : "Audit Person",
		editable : true,
		valueField : "id",
		flex : 2,
		displayField : "empsName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		allowBlank : false,
		blankText : "Please choose Sale!",
		tabIndex : 4,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 250,// 下
		triggerAction : 'all'
	});

	// 产品分类
	var typeLv2Box = new BindCombox({
				dataUrl : "servlet/DataSelvert?tbname=CotTypeLv2&key=typeName",
				cmpId : 'eleTypeidLv2',
				fieldLabel : "Classification of samples",
				editable : true,
				valueField : "id",
				allowBlank : true,
				displayField : "typeName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				tabIndex : 38,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 海关编码
	var eleHsidBox = new BindCombox({
				dataUrl : "servlet/DataSelvert?tbname=CotEleOther&key=cnName",
				cmpId : 'eleHsid',
				fieldLabel : "HS code",
				editable : true,
				valueField : "id",
				allowBlank : true,
				displayField : "cnName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				tabIndex : 50,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});
	// 币种
	var curBox = new BindCombox({
				cmpId : 'currencyId',
				dataUrl : "servlet/DataSelvert?tbname=CotCurrency",
				emptyText : 'Choose',
				fieldLabel : "<font color=red>Currency</font>",
				displayField : "curNameEn",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				allowBlank : false,
				blankText : "Please choose the Currency!",
				tabIndex : 7,
				listeners : {
					"select" : function(com, rec, index) {
						composeChange();
						priceBlurByCurreny(rec.data.id);
					}
				}
			});

	// 表格--币种
	var curGridBox = new BindCombox({
				cmpId : 'priceFacUint',
				dataUrl : "servlet/DataSelvert?tbname=CotCurrency",
				emptyText : 'Choose',
				hideLabel : true,
				autoLoad : true,
				labelSeparator : " ",
				displayField : "curNameEn",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%"
			});

	// 条款类型
	var clauseBox = new BindCombox({
				cmpId : 'clauseTypeId',
				dataUrl : "servlet/DataSelvert?tbname=CotClause",
				emptyText : 'Choose',
				fieldLabel : "Delivery Terms",
				displayField : "clauseName",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 15,
				listeners : {
					"select" : function(com, rec, index) {
						priceBlur();
						composeChange();
					}
				}
			});
	// 起运港
	var shipPortBox = new BindCombox({
				dataUrl : "servlet/DataSelvert?tbname=CotShipPort&key=shipPortNameEn",
				cmpId : 'shipportId',
				fieldLabel : "Port of Loading",
				editable : true,
				valueField : "id",
				allowBlank : true,
				displayField : "shipPortNameEn",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				tabIndex : 11,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,
				listeners : {
					"select" : function(com, rec, index) {
						composeChange();
					}
				}
			});
	// 目的港
	var targetPortBox = new BindCombox({
		dataUrl : "servlet/DataSelvert?tbname=CotTargetPort&key=targetPortEnName",
		cmpId : 'targetportId',
		fieldLabel : "Port of destination",
		editable : true,
		valueField : "id",
		allowBlank : true,
		displayField : "targetPortEnName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		tabIndex : 12,
		sendMethod : "post",
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		listeners : {
			"select" : function(com, rec, index) {
				composeChange();
			}
		}
	});

	// 集装箱
	var containerBox = new BindCombox({
				cmpId : 'containerTypeId',
				dataUrl : "servlet/DataSelvert?tbname=CotContainerType",
				emptyText : 'Choose',
				fieldLabel : "Container",
				displayField : "containerName",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 13,
				listeners : {
					"select" : function(com, rec, index) {
						priceBlur();
					}
				}
			});

	// 佣金类型
	var commisionBox = new BindCombox({
				cmpId : 'commisionTypeId',
				dataUrl : "servlet/DataSelvert?tbname=CotCommisionType",
				emptyText : 'Choose',
				fieldLabel : "佣金类型",
				displayField : "commisionName",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 16,
				listeners : {
					"select" : function(com, rec, index) {
						composeChange();
					}
				}
			});

	// 折扣
	var zheStore = new Ext.data.SimpleStore({
				fields : ["tp", "name"],
				data : [[0, '不打折'], [1, '单价'], [2, '货款金额']]
			});
	var zheBox = new Ext.form.ComboBox({
				name : 'zheType',
				tabIndex : 20,
				fieldLabel : '折扣',
				editable : false,
				// emptyText : 'Choose',
				store : zheStore,
				valueField : "tp",
				displayField : "name",
				mode : 'local',
				validateOnBlur : true,
				triggerAction : 'all',
				anchor : "100%",
				value : 0,// 默认不打折
				hiddenName : 'zheType',
				selectOnFocus : true,
				listeners : {
					"change" : sumZhe
				}
			});

	// 运输方式
	var trafficBox = new BindCombox({
				cmpId : 'trafficId',
				dataUrl : "servlet/DataSelvert?tbname=CotTrafficType",
				emptyText : 'Choose',
				fieldLabel : "运输方式",
				displayField : "trafficNameEn",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 26
			});

	// 保险契约
	var insureContractBox = new BindCombox({
				cmpId : 'insureContractId',
				dataUrl : "servlet/DataSelvert?tbname=CotInsureContract",
				emptyText : 'Choose',
				fieldLabel : "保险契约",
				displayField : "insureNameEn",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 27
			});

	// 付款方式
	var payTypeBox = new BindCombox({
				cmpId : 'payTypeId',
				dataUrl : "servlet/DataSelvert?tbname=CotPayType",
				emptyText : 'Choose',
				fieldLabel : "Pay.Terms",
				displayField : "payName",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 14
			});

	// 银行
	var bankBox = new BindCombox({
				cmpId : 'bankId',
				dataUrl : "servlet/DataSelvert?tbname=CotBank",
				emptyText : 'Choose',
				fieldLabel : "银行",
				displayField : "bankShortName",
				valueField : "id",
				triggerAction : "all",
				anchor : "100%",
				tabIndex : 28
			});

	// 审核状态
	var shenStore = new Ext.data.SimpleStore({
				fields : ["tp", "name"],
				data : [[0, 'Waiting'], [1, 'No Pass'], [2, 'Approved'],
						[3, 'Approval'], [9, 'No Audit']]
			});
	var shenBox = new Ext.form.ComboBox({
				name : 'orderStatus',
				tabIndex : 29,
				disabled : true,
				disabledClass : 'combo-disabled',
				fieldLabel : 'Status',
				editable : false,
				value : 9,
				store : shenStore,
				valueField : "tp",
				displayField : "name",
				mode : 'local',
				validateOnBlur : true,
				triggerAction : 'all',
				anchor : "100%",
				hiddenName : 'orderStatus',
				selectOnFocus : true
			});
	// 材质
	var typeLv1Box = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotTypeLv1&key=typeName",
				cmpId : 'eleTypeidLv1',
				fieldLabel : "材质",
				editable : true,
				valueField : "id",
				displayField : "typeName",
				emptyText : 'Choose',
				pageSize : 10,
				sendMethod : "post",
				anchor : "100%",
				tabIndex : 34,
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 表格--材质
	var typeLv1GridBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotTypeLv1&key=typeName",
				cmpId : 'eleTypeidLv1',
				editable : true,
				autoLoad : true,
				hideLabel : true,
				sendMethod : "post",
				labelSeparator : " ",
				valueField : "id",
				displayField : "typeName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 主单厂家
	var factoryBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotFactory&key=shortName",
				cmpId : 'factoryId',
				fieldLabel : "<font color=red>Supplier</font>",
				editable : true,
				valueField : "id",
				displayField : "shortName",
				emptyText : 'Choose',
				pageSize : 10,
				sendMethod : "post",
				anchor : "100%",
				tabIndex : 34,
				selectOnFocus : true,
				allowBlank : false,
				blankText : 'Please choose Supplier!',
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all',
				listeners : {
					"select" : function(com, rec, index) {
							var factoryId = factoryBox.getValue();
							cotFactoryService.getFactoryById(factoryId,
									function(res) {
										if (res != null) {
											//起运港
											shipPortBox.bindPageValue('CotFactory','id',res.shipportId);
											if (Ext.getCmp('isCheckAgent').checked) {
												var city = '';
												var nation = '';
												var fullName = '';
												var adr = '';
												var post='';
												if (!Ext.isEmpty(res.post)) {
													fullName = res.post
															+ ',\n'
												}
												if (!Ext.isEmpty(res.factoryAddr)) {
													adr = res.factoryAddr + ',\n'
												}
												if(!Ext.isEmpty(res.customerPost)){
													post= res.customerPost+','
												}
												if (!Ext
														.isEmpty(cityMap[res.cityId])) {
													city = cityMap[res.cityId]
															+ ',\n'
												}
												if (!Ext
														.isEmpty(nationMap[res.nationId])) {
													nation = nationMap[res.nationId];
												}
												var str = fullName + adr + post+city + nation;
												var start = str.indexOf(',');
												var end = str.lastIndexOf(',');
												var strLength=str.length-2;
												if (start == end) {
													if(start==strLength){
														str=str.substring(0,strLength);
													}
												} else {
													str = str.substring(0, end);
												}
												
												Ext.getCmp('seller').setValue(str);
												txtAreaAry.seller = str;
										}
										}
									});
						//}
					}
				}
			});

	// 右边折叠表单厂家
	var facBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotFactory&key=shortName",
				cmpId : 'factoryId',
				fieldLabel : "Supplier",
				editable : true,
				hidden : hideFac,
				hideLabel : hideFac,
				sendMethod : "post",
				valueField : "id",
				displayField : "shortName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : "100%",
				tabIndex : 42,
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});

	// 表格-厂家
	var facGridBox = new BindCombox({
		dataUrl : "./servlet/DataSelvert?tbname=CotFactory&key=shortName&typeName=factroyTypeidLv1&type=1",
		cmpId : 'factoryId',
		hidden : hideFac,
		hideLabel : true,
		labelSeparator : " ",
		editable : true,
		sendMethod : "post",
		autoLoad : true,
		valueField : "id",
		displayField : "shortName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : "100%",
		tabIndex : 35,
		selectOnFocus : true,
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all'
	});

	// 右键--导出图片
	var picStore = new Ext.data.SimpleStore({
				fields : ["tp", "name"],
				data : [['png', 'png'], ['jpg', 'jpg'], ['bmp', 'bmp'],
						['gif', 'gif']]
			});
	var picTypeBox = new Ext.form.ComboBox({
				name : 'picType',
				labelSeparator : ' ',
				hideLabel : true,
				editable : false,
				store : picStore,
				valueField : "tp",
				displayField : "name",
				mode : 'local',
				getListParent : function() {
					return this.el.up('.x-menu');
				},
				value : 'png',
				flex : 2,
				validateOnBlur : true,
				triggerAction : 'all',
				hiddenName : 'picType',
				selectOnFocus : true
			});

	// 锁定套数
	var lockUnitNum = function() {
		var fly = Ext.getDom('eleFlag').value;
		if (fly == 0) {
			// Ext.getDom('eleFlag').setValue(1);
			Ext.getCmp('eleUnitNum').setValue(1);
			Ext.getCmp('eleUnitNum').setDisabled(true);
		} else {
			Ext.getCmp('eleUnitNum').setDisabled(false);
		}
	};
	// 组成方式
	var eleFlagStore = new Ext.data.SimpleStore({
				fields : ["id", "name"],
				data : [[0, '单件'], [1, '套件'], [3, '组件']]
			});
	var eleFlagBox = new Ext.form.ComboBox({
				name : 'eleFlag',
				fieldLabel : '组成方式',
				editable : false,
				store : eleFlagStore,
				valueField : "id",
				displayField : "name",
				mode : 'local',
				validateOnBlur : true,
				triggerAction : 'all',
				anchor : "100%",
				tabIndex : 36,
				emptyText : 'Choose',
				hiddenName : 'eleFlag',
				selectOnFocus : true,
				listeners : {
					"select" : lockUnitNum
				}
			});

	// 产品来源
	var sourceStore = new Ext.data.SimpleStore({
				fields : ["tp", "name"],
				data : [['WOLLY', 'WOLLY'], ['SUPPLIER', 'SUPPLIER'],
						['CUSTOMER', 'CUSTOMER']]
			});
	var sourceBox = new Ext.form.ComboBox({
				name : 'eleFrom',
				tabIndex : 48,
				fieldLabel : 'Source',
				editable : false,
				value : 'WOLLY',
				store : sourceStore,
				valueField : "tp",
				displayField : "name",
				mode : 'local',
				validateOnBlur : true,
				triggerAction : 'all',
				anchor : "100%",
				hiddenName : 'eleFrom',
				selectOnFocus : true
			});

	// 包装方案
	var boxPacking = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxType",
				valueField : "id",
				// fieldLabel : "Packing Way",
				hidden : true,
				tabIndex : 63,
				displayField : "typeName",
				cmpId : "boxTypeId",
				emptyText : 'Choose',
				anchor : "95%",
				listeners : {
					"select" : selectBind
				}
			});
	// 产品类型
	var boxPbTypeBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxPacking&type=PB",
				valueField : "id",
				// fieldLabel : "Material Type",
				hidden : true,
				tabIndex : 65,
				displayField : "value",
				cmpId : "boxPbTypeId",
				emptyText : 'Choose',
				labelSeparator : " ",
				anchor : "100%",
				listeners : {
					"select" : function(com, rec, index) {
						DWREngine.setAsync(false);
						updateMapValue($('rdm').value, "boxPbTypeId",
								rec.data.id);
						DWREngine.setAsync(true);
						calPrice();
					}
				}
			});
	// 内包装类型
	var boxIbTypeBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxPacking&type=IB",
				valueField : "id",
				hidden : true,
				// fieldLabel : "Material Type",
				tabIndex : 70,
				displayField : "value",
				cmpId : "boxIbTypeId",
				emptyText : 'Choose',
				labelSeparator : " ",
				anchor : "100%",
				listeners : {
					"select" : function(com, rec, index) {
						DWREngine.setAsync(false);
						updateMapValue($('rdm').value, "boxIbTypeId",
								rec.data.id);
						DWREngine.setAsync(true);
						calPrice();
					}
				}
			});
	// 中包装类型
	var boxMbTypeBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxPacking&type=MB",
				valueField : "id",
				fieldLabel : "/",
				tabIndex : 75,
				displayField : "value",
				cmpId : "boxMbTypeId",
				emptyText : 'Choose',
				labelSeparator : " ",
				anchor : "100%",
				listeners : {
					"select" : function(com, rec, index) {
						DWREngine.setAsync(false);
						updateMapValue($('rdm').value, "boxMbTypeId",
								rec.data.id);
						DWREngine.setAsync(true);
						calPrice();
					}
				}
			});
	// 外包装类型
	var boxObTypeBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxPacking&type=OB",
				valueField : "id",
				fieldLabel : "Material Type",
				tabIndex : 75,
				displayField : "value",
				cmpId : "boxObTypeId",
				emptyText : 'Choose',
				labelSeparator : " ",
				anchor : "100%",
				listeners : {
					"select" : function(com, rec, index) {
						DWREngine.setAsync(false);
						updateMapValue($('rdm').value, "boxObTypeId",
								rec.data.id);
						DWREngine.setAsync(true);
						calPrice();
					}
				}
			});

	// 插格类型
	var inputGridTypeIdBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotBoxPacking&type=IG",
				valueField : "id",
				fieldLabel : "插格类型",
				editable : true,
				tabIndex : 54,
				displayField : "value",
				cmpId : "inputGridTypeId",
				emptyText : 'Choose',
				anchor : "100%",
				listeners : {
					"select" : function(com, rec, index) {
						DWREngine.setAsync(false);
						updateMapValue($('rdm').value, "inputGridTypeId",
								rec.data.id);
						DWREngine.setAsync(true);
						calPrice();
					}
				}
			});

	// 大类
	var typeBox = new BindCombox({
		dataUrl : "./servlet/DataSelvert?tbname=CotTypeLv1&key=typeEnName",
		cmpId : 'byId',
		fieldLabel : "Dep. Of Sales",
		editable : true,
		valueField : "id",
		displayField : "typeEnName",
		emptyText : 'Choose',
		pageSize : 10,
		anchor : '100%',
		sendMethod : "post",
		selectOnFocus : true,
		allowBlank : false,
		blankText : "Choose Dep. Of Sales！",
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all',
		listeners : {
			"select" : function(com, rec, index) {
				if (rec.data.id != '') {
					type2Box
							.setDataUrl("./servlet/DataSelvert?tbname=CotTypeLv2&key=typeName&typeName=typeIdLv1&type="
									+ rec.data.id);
					type2Box.resetData();
					type3Box.resetData();
				}
			}
		}
	});

	// 中类
	var type2Box = new BindCombox({
		dataUrl : "./servlet/DataSelvert?tbname=CotTypeLv2&key=typeName&typeName=typeIdLv1&type=0",
		cmpId : 'myId',
		fieldLabel : "Group",
		editable : true,
		valueField : "id",
		displayField : "typeName",
		emptyText : 'Choose',
		anchor : '100%',
		pageSize : 10,
		sendMethod : "post",
		selectOnFocus : true,
		allowBlank : false,
		blankText : "Choose Group！",
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all',
		listeners : {
			"select" : function(com, rec, index) {
				if (rec.data.id != '') {
					type3Box
							.setDataUrl("./servlet/DataSelvert?tbname=CotTypeLv3&key=typeName&typeName=typeIdLv2&type="
									+ rec.data.id);
					type3Box.resetData();
				}
			}
		}
	});

	// 小类
	var type3Box = new BindCombox({
		dataUrl : "./servlet/DataSelvert?tbname=CotTypeLv3&key=typeName&typeName=typeIdLv2&type=0",
		cmpId : 'syId',
		fieldLabel : "Category",
		editable : true,
		anchor : '100%',
		valueField : "id",
		displayField : "typeName",
		emptyText : 'Choose',
		pageSize : 10,
		sendMethod : "post",
		selectOnFocus : true,
		allowBlank : false,
		blankText : "Choose Category！",
		minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
		listWidth : 350,// 下
		triggerAction : 'all'
	});

	// 供应厂家
	var facEleBox = new BindCombox({
				dataUrl : "./servlet/DataSelvert?tbname=CotFactory&key=shortName",
				cmpId : 'facEleId',
				fieldLabel : "Supplier",
				editable : true,
				valueField : "id",
				displayField : "shortName",
				emptyText : 'Choose',
				pageSize : 10,
				anchor : '100%',
				allowBlank : false,
				blankText : "Choose a Supplier！",
				tabIndex : 2,
				sendMethod : "post",
				selectOnFocus : true,
				minChars : 1, // 设置填充几个字节就去查一次,默认为4个字节
				listWidth : 350,// 下
				triggerAction : 'all'
			});
	// 开启实达合同条款面板
	// var sdContract = new ContractSD();
	/** ******EXT创建grid步骤******** */
	var roleRecord = new Ext.data.Record.create([{
				name : "id",
				type : "int"
			}, {
				name : "eleId"
			}, {
				name : "sortNo"
			}, {
				name : "custNo"
			}, {
				name : "eleName"
			}, {
				name : "eleNameEn"
			}, {
				name : "eleCol"
			}, {
				name : "orderPrice",
				type : "float",
				convert : numFormat.createDelegate(this, [strNum], 3)
			}, {
				name : "checkFlag"
			}, {
				name : "barcode"
			}, {
				name : "taoUnit"
			}, {
				name : "eleUnit"
			}, {
				name : "boxWeigth",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "liRun",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "tuiLv",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "boxCount",
				type : "int"
			}, {
				name : "containerCount",
				type : "int"
			}, {
				name : "totalMoney",
				type : "float",
				convert : numFormat.createDelegate(this, [strNum], 3)
			}, {
				name : "boxCbm",
				type : "float",
				convert : numFormat.createDelegate(this, [cbmStr], 3)
			}, {
				name : "totalCbm",
				type : "float",
				convert : numFormat.createDelegate(this, [cbmStr], 3)
			}, {
				name : "totalGrossWeigth",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.000"], 3)
			}, {
				name : "factoryId"
			}, {
				name : "factoryNo"
			}, {
				name : "priceFac",
				type : "float",
				convert : numFormat.createDelegate(this, [facNumTemp], 3)
			}, {
				name : "priceFacUint"
			}, {
				name : "eleTypeidLv1"
			}, {
				name : "eleSizeDesc"
			}, {
				name : "eleInchDesc"
			}, {
				name : "boxIbCount",
				type : "int"
			}, {
				name : "boxMbCount",
				type : "int"
			}, {
				name : "boxObCount",
				type : "int"
			}, {
				name : "boxObL",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "boxObW",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "boxObH",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.00"], 3)
			}, {
				name : "boxGrossWeigth",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.000"], 3)
			}, {
				name : "boxNetWeigth",
				type : "float",
				convert : numFormat.createDelegate(this, ["0.000"], 3)
			}, {
				name : "type"
			}, {
				name : "srcId"
			}, {
				name : "rdm"
			}]);
	var writer = new Ext.data.JsonWriter({
				encode : true,
				writeAllFields : true
			});
	// 创建数据源
	var ds = new Ext.data.Store({
		autoSave : false,
		method : 'post',
		proxy : new Ext.data.HttpProxy({
			api : {
				read : "cotorder.do?method=queryOrderDetail&orderId="
						+ $('pId').value,
				create : "cotorder.do?method=add",
				update : "cotorder.do?method=modify",
				destroy : "cotorder.do?method=remove"
			},
			listeners : {
				beforeload : function(store, options) {
					ds.removed = [];
					// cotOrderService.clearMap("order", function(res) {
					// });
				},
				load : function(store, recs, options) {
					options.callback = function(r, ops, success) {
						if (success == false) {
							Ext.Msg
									.alert("Message",
											"Data Query Error! Please contact the webmaster!");
						} else {
							sumTotal();
						}
					}
				},
				exception : function(proxy, type, action, options, res, arg) {
					// 从异常中的响应文本判断是否成功
					if (res.status != 200) {
						Ext.Msg.alert("Message", "Operation failed！");
					} else {
						// 判断是不是excel导入时保存
						if (_self.exlFlag) {
							// 直接导入excel
							saveReport(_self.eFlag, _self.filename,
									_self.isCover);
						} else {
							ds.reload();
						}
						_self.exlFlag = false;
						// 修改主单的总数量,总箱数,总体积,总金额
						cotOrderService.modifyCotOrderTotalAction(
								$('pId').value, function(res) {
									if (res != null) {
										$('totalLab').innerText = res[0]
												.toFixed(deNum);
										$('realLab').innerText = res[2]
												.toFixed(deNum);
										$('totalCbmLab').innerText = res[1]
												.toFixed(cbmNum);
										$('totalGrossLab').innerText = res[3]
												.toFixed("3");
									}
								});
					}
					unmask();
				},
				// 保存表格前显示提示消息
				beforewrite : function(proxy, action, rs, options, arg) {
					mask();
				}
			}
		}),
		reader : new Ext.data.JsonReader({
					root : "data",
					totalProperty : "totalCount",
					idProperty : "id"
				}, roleRecord),
		writer : writer
	});
	// 创建复选框列
	var sm = new Ext.grid.CheckboxSelectionModel();

	checkColumn = new Ext.grid.CheckColumn({
				header : '<input type="checkbox" onclick="checkAll(this)">',
				sortable : false,
				align : 'center',
				dataIndex : 'checkFlag',
				menuDisabled : true,
				tooltip : "Lock in prices",
				width : 35
			});

	// 表格中的客号文本框
	var custNoTxt = new Ext.form.TextField({
				maxLength : 100,
				listeners : {
					'focus' : function(txt) {
						txt.selectText();
					},
					"specialkey" : function(txt, eObject) {
						var temp = txt.getValue();
						if (temp != ""
								&& eObject.getKey() == Ext.EventObject.ENTER) {
							if (isNaN(editRec.id)) {
								insertByCustNo(temp);
							}
						}
					}
				}
			});

	// 储存数量单元格获得焦点事件的文本框坐标
	var ckX;
	var ckY;

	// 设置条形码单号
	function setBarcodeNo2() {
		var bc = "";
		DWREngine.setAsync(false);
		baseDataUtil.getBarcodeNo(function(ps) {
					var a = 5;
					var b = 7;
					var c = 0;
					var d = 4;
					var e = 0;
					var f = 3;
					var g = 9;

					var h = parseInt(ps.substring(ps.length - 5, ps.length - 4));
					var i = parseInt(ps.substring(ps.length - 4, ps.length - 3));
					var j = parseInt(ps.substring(ps.length - 3, ps.length - 2));
					var k = parseInt(ps.substring(ps.length - 2, ps.length - 1));
					var l = parseInt(ps.substring(ps.length - 1));

					var AA = (b + d + f + h + j + l) * 3;
					var BB = (a + c + e + g + i + k) + AA;
					var temp = (BB + "");
					var last = temp.substring(temp.length - 1);
					var CC = 10 - parseInt(last);
					if (CC == 10) {
						CC = 0;
					}
					bc = "5704039" + ps.substring(ps.length - 5) + CC;
				});
		DWREngine.setAsync(true);
		return bc;
	}

	// 创建需要在表格显示的列
	var cm = new HideColumnModel({
				defaults : {
					sortable : true
				},
				hiddenCols : orderMap,
				columns : [sm, {
							header : "ID",
							dataIndex : "id",
							width : 25,
							hidden : true
						}, {
							header : "Sort",
							align : 'center',
							dataIndex : "sortNo",
							menuDisabled : true,
							width : 40,
							editor : new Ext.form.NumberField({
										maxValue : 999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "W&C Art No.",
							dataIndex : "eleId",
							width : 150,
							editor : new Ext.form.TextField({
										maxLength : 100,
										listeners : {
											'change' : function(txt) {
												if (isNaN(editRec.id)) {
													ds.remove(editRec);// 删除行
												}
											},
											"specialkey" : function(field, e) {
												if (e.getKey() == Ext.EventObject.TAB
														&& field.getValue() != "") {
													ds.remove(editRec);// 删除行
												}
											}
										}
									}),
							summaryRenderer : function(v, params, data) {
								params.css = 'fg';
								return "Total：";
							}
						}, {
							header : "Client Art No.",
							dataIndex : "custNo",
							editor : custNoTxt,
							width : 120
						}, {
							header : "Barcode",
							dataIndex : "barcode",
							editor : new Ext.form.TriggerField({
										maxLength : 100,
										triggerClass : 'barcode',
										onTriggerClick : function() {
											var bar = setBarcodeNo2();
											this.setValue(bar);
										}
									}),
							width : 120
						}, {
							header : "Descripiton",
							dataIndex : "eleNameEn",
							editor : new Ext.form.TextArea({
										maxLength : 200,
										height : 25,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							width : 120
						}, {
							header : "Sales Price",
							dataIndex : "orderPrice",
							width : 80,
							editor : new Ext.form.NumberField({
										maxValue : 9999999.9999,
										decimalPrecision : deNum,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, checkColumn, {
							header : "Unit",
							dataIndex : "eleUnit",
							editor : new Ext.form.TextField({
										maxLength : 100,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							width : 50
						}, {
							header : "Quantity",
							dataIndex : "boxCount",
							width : 60,
							summaryType : 'sum',
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
												var temp = txt.getPosition();
												ckX = temp[0] + txt.getWidth();
												ckY = temp[1];
											}
										}
									})
						}, {
							header : "Cartons",
							dataIndex : "containerCount",
							width : 60,
							summaryType : 'sum',
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
												var temp = txt.getPosition();
												ckX = temp[0] + txt.getWidth();
												ckY = temp[1];
											}
										}
									})
						},{
							header : "Size Description",
							dataIndex : "eleInchDesc",
							width : 100,
							editor : new Ext.form.TextField({
										
									})
						}, {
							header : "Amount",
							dataIndex : "totalMoney",
							width : 80,
							// hidden : true,
							summaryType : 'sum'
						}, {
							header : "Supplier",
							dataIndex : "factoryId",
							editor : facGridBox,
							width : 80,
							editable : !hideFac,
							hidden : true,
							renderer : function(value) {
								if (hideFac == true) {
									return "*";
								} else {
									return facData[value];
								}
							}
						}, {
							header : "Supplier's A.No.",
							dataIndex : "factoryNo",
							width : 100,
							editor : new Ext.form.TextField({
										maxLength : 100,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Purchase Price",
							dataIndex : "priceFac",
							width : 100,
							editable : !hidePri,
							hidden : hidePri,
							editor : new Ext.form.NumberField({
										maxValue : 99999999.9999,
										decimalPrecision : facNum,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							renderer : function(value) {
								if (hidePri == true) {
									return "*";
								} else {
									return value;
								}
							}
						}, {
							header : "Currency",
							dataIndex : "priceFacUint",
							editable : !hidePri,
							hidden : hidePri,
							editor : curGridBox,
							width : 90,
							renderer : function(value) {
								if (hidePri == true) {
									return "*";
								} else {
									return curData[value];
								}
							}
						}, {
							header : "Profit%",
							dataIndex : "liRun",
							width : 80,
							summaryType : 'average',
							editor : new Ext.form.NumberField({
										maxValue : 999999.99,
										decimalPrecision : 2,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Inner Box",
							dataIndex : "boxIbCount",
							hidden : true,
							width : 80,
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Outer Box",
							dataIndex : "boxObCount",
							width : 80,
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
												var temp = txt.getPosition();
												ckX = temp[0] + txt.getWidth();
												ckY = temp[1];
											}
										}
									})
						}, {
							header : "CBM",
							dataIndex : "boxCbm",
							width : 60,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 999999999.999999,
										decimalPrecision : cbmNum,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "N.W(Kgs)",
							dataIndex : "boxNetWeigth",
							width : 80,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 9999.9999,
										decimalPrecision : 4,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "G.W(Kgs)",
							dataIndex : "boxGrossWeigth",
							width : 80,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 9999.9999,
										decimalPrecision : 4,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "type",
							dataIndex : "type",
							editor : new Ext.form.TextField({
										maxLength : 100
									}),
							hidden : true
						}, {
							header : "srcId",
							dataIndex : "srcId",
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0
									}),
							hidden : true
						}, {
							header : "Total gross weight",
							summaryType : 'sum',
							dataIndex : "totalGrossWeigth",
							hidden : true
						}, {
							header : "Chinese name",
							dataIndex : "eleName",
							hidden : true,
							editor : new Ext.form.TextArea({
										maxLength : 200,
										height : 25,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Color",
							dataIndex : "eleCol",
							hidden : true,
							editor : new Ext.form.TextField({
										maxLength : 100,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Unit Price",
							dataIndex : "taoUnit",
							hidden : true,
							editor : new Ext.form.TextField({
										maxLength : 100,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							width : 60
						}, {
							header : "Weight",
							dataIndex : "boxWeigth",
							width : 60,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 999999.99,
										decimalPrecision : 2,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "Tax rate％",
							dataIndex : "tuiLv",
							width : 60,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 99999999.99,
										decimalPrecision : 2,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "TOTAL CBM",
							dataIndex : "totalCbm",
							width : 60,
							hidden : true,
							summaryType : 'sum'
						}, {
							header : "Material",
							dataIndex : "eleTypeidLv1",
							width : 80,
							hidden : true,
							editor : typeLv1GridBox,
							renderer : function(value) {
								return typeData[value];
							}
						}, {
							header : "M",
							dataIndex : "boxMbCount",
							width : 35,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "外箱长",
							dataIndex : "boxObL",
							width : 50,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 9999.9999,
										decimalPrecision : 4,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "外箱宽",
							dataIndex : "boxObW",
							width : 50,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 9999.9999,
										decimalPrecision : 4,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "外箱高",
							dataIndex : "boxObH",
							width : 50,
							hidden : true,
							editor : new Ext.form.NumberField({
										maxValue : 9999.9999,
										decimalPrecision : 4,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									})
						}, {
							header : "产品规格(CM)",
							dataIndex : "eleSizeDesc",
							hidden : true,
							editor : new Ext.form.TextArea({
										maxLength : 500,
										height : 25,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							width : 90
						}, {
							header : "产品规格(INCH)",
							dataIndex : "eleInchDesc",
							hidden : true,
							editor : new Ext.form.TextArea({
										height : 25,
										maxLength : 500,
										listeners : {
											'focus' : function(txt) {
												txt.selectText();
											}
										}
									}),
							width : 100
						}, {
							header : "rdm",
							dataIndex : "rdm",
							editor : new Ext.form.NumberField({
										maxValue : 99999999,
										decimalPrecision : 0
									}),
							hidden : true
						}]
			});

	var toolBar = new Ext.PagingToolbar({
		pageSize : 1000,
		store : ds,
		displayInfo : true,
		// //displayMsg : '显示第 {0} - {1}条记录 共{2}条记录',
		displaySize : 'NONE'
			// emptyMsg : "No data to display"
		});
	var tb = new Ext.Toolbar({
				items : [{
							text : "Create",
							handler : addNewGrid,
							iconCls : "page_add",
							cls : "SYSOP_ADD"
						}, '-', {
							text : "Del",
							handler : onDel,
							iconCls : "page_del",
							cls : "SYSOP_DEL"
						}, '-', {
							text : "Import",
							handler : showImportPanel.createDelegate(this, [0]),
							iconCls : "importEle",
							cls : "SYSOP_ADD"
						}, '-', {
							text : "Barcode Machine",
							handler : showPanPanel,
							iconCls : "barcode",
							cls : "SYSOP_PRINT"
						},
						// '-', {
						// text : "配件及成本信息",
						// handler : showFitPricePanel,
						// iconCls : "gird_list",
						// cls : "SYSOP_PRINT"
						// },
						'-', {
							text : "Inverse margin",
							handler : calLiRun,
							iconCls : "cal",
							cls : "SYSOP_ADD"
						}, '-', {
							text : "Create Art.No",
							handler : showEleModel,
							iconCls : "page_add",
							cls : "SYSOP_ADD"
						}]
			});

	// 合计行
	var summary = new Ext.ux.grid.GridSummary();
	// 订单明细表格
	var grid = new Ext.grid.EditorGridPanel({
				region : "center",
				id : "orderDetailGrid",
				stripeRows : true,
				margins : "0 5 0 0",
				bodyStyle : 'width:100%',
				store : ds,
				cm : cm,
				sm : sm,
				plugins : [checkColumn, summary],
				loadMask : true,
				tbar : tb,
				cls : 'rightBorder',
				border : false,
				bbar : toolBar,
				viewConfig : {
					forceFit : false
				}
			});
	// 单元格双击事件--1.控制新增一条货号后,货号eleId不能再双击;2.让单元格的editor适应行高度
	grid.on("celldblclick", function(grid, rowIndex, columnIndex, e) {
				// if ($('orderStatus').value == 2 && loginEmpId != "admin") {
				// Ext.MessageBox
				// .alert('Message',
				// 'Sorry, this record has been reviewed can not be modified!');
				// return false;
				// }
				var rec = ds.getAt(rowIndex);
				var dataIndex = cm.getDataIndex(columnIndex);
				if (isNaN(rec.id) && dataIndex == 'eleId'
						&& rec.data.rdm != null && rec.data.rdm != "") {
					return false;
				}
				if (dataIndex == 'factoryId' && hideFac == true) {
					return false;
				}
				if ((dataIndex == 'priceFac' || dataIndex == 'priceFacUint')
						&& hidePri == true) {
					return false;
				}
				// 获得view
				var view = grid.getView();
				// 获得单元格
				var cell = view.getCell(rowIndex, columnIndex);
				// 获得该行高度
				var row = view.getRow(rowIndex);
				var editor = cm.getCellEditor(columnIndex, rowIndex);
				editor.setSize(cell.offsetWidth, row.scrollHeight);
			});

	// 表格编辑前储存该行,用于editor中的一些事件处理
	var editRec = {};
	grid.on('beforeedit', function(e) {
				editRec = e.record;
			});

	// 表格行点击,加载右边面板数据
	grid.on('rowclick', function(grid, rowIndex, e) {
				// 如果右边折叠面板有展开过才加载数据
				if (rightForm.isVisible()) {
					initForm(ds.getAt(rowIndex));
				}
			});
	// 单元格编辑后,讲修改后的值储存到内存map中,并即时修改右边面板数据
	grid.on("afteredit", function(e) {
				if (e.field == 'eleId') {
					if (isNaN(e.record.id)) {
						insertByCfg(e.value.toUpperCase());
					} else {
						updateMapValue(e.record.data.rdm, e.field, e.value);
					}
				} else if (e.field == 'orderPrice') {// 价格
					priceOutChange(e.value);
				} else if (e.field == 'liRun') {// 利润率
					liRunChange(e.value);
				} else if (e.field == 'boxWeigth') {// 单重
					boxWeigthChange(e.value);
				} else if (e.field == 'tuiLv') {// 退税率
					tuiLvChange(e.value);
				} else if (e.field == 'boxCount') {// 数量
					countNum(e.value, e.originalValue);
				} else if (e.field == 'containerCount') {// 箱数
					containNum(e.value, e.originalValue);
				} else if (e.field == 'boxCbm') {// boxCbm
					changeCbm(e.value);
				} else if (e.field == 'priceFac') {// 生产价
					priceFacChange(e.value);
				} else if (e.field == 'priceFacUint') {// 生产价币种
					priceFacUintChange(e.value);
				} else if (e.field == 'boxIbCount') {// 内
					boxIcountNum(e.value);
				} else if (e.field == 'boxMbCount') {// 中
					boxMcountNum(e.value);
				} else if (e.field == 'boxObCount') {// 外
					boxOcountNum(e.value, e.originalValue);
				} else if (e.field == 'boxObL') {// 外箱长
					changeBoxObL(e.value, false);
				} else if (e.field == 'boxObW') {// 外箱宽
					changeBoxObW(e.value, false);
				} else if (e.field == 'boxObH') {// 外箱高
					changeBoxObH(e.value, false);
				} else if (e.field == 'boxGrossWeigth') {// 毛重
					changeGross(e.value);
				} else {
					updateMapValue(e.record.data.rdm, e.field, e.value);
				}
			});

	// 右键菜单
	var rightMenu = new Ext.menu.Menu({
		id : "rightMenu",
		items : [{
					text : "Save sort No.",
					handler : sumSortTable
				}, {
					text : "Exporting pictures",
					menu : {
						layout : 'hbox',
						layoutConfig : {
							align : 'middle'
						},
						width : 200,
						items : [picTypeBox, {
							xtype : 'button',
							text : "Export",
							flex : 1,
							iconCls : 'page_img',
							handler : function() {
								if (picTypeBox.getValue() == '') {
									return;
								}
								if (sm.getCount() == 0) {
									Ext.Msg
											.alert('Message',
													'Please select the Order Details records!');
								} else {
									rightMenu.hide();
									downPics();
								}
							}
						}]
					}
				}, {
					text : "Information View",
					menu : {
						items : [
								// {
								// text : "配件及成本",
								// handler : showFitPricePanel
								// },
								{
							text : "Price history records",
							handler : showHisPricePanel
						}, {
							text : "MOQ with different price",
							handler : showModPriceWin
						}, {
							text : "Shipping documents",
							handler : showOrderOut
						}]
					}
				}, {
					text : "Data Synchronization",
					menu : {
						items : [{
									text : "Synchronized to the sample",
									handler : showTongDiv
								}, {
									text : "Synchronized to order",
									handler : showTongPriceDiv
								}]
					}
				}, {
					text : "Data import",
					menu : {
						items : [{
									text : "Import from quotation",
									handler : showImportPanel.createDelegate(
											this, [1])
								}, {
									text : "Import from order",
									handler : showImportPanel.createDelegate(
											this, [2])
								}
								// , {
								// text : "Import from sample",
								// handler : showImportPanel.createDelegate(
								// this, [3])
								// }
								, {
									text : "Import from excel",
									handler : showImportPanel.createDelegate(
											this, [0])
								}
								// , {
								// text : "Import from sub-sample",
								// handler : showImportPanel.createDelegate(
								// this, [4])
								// }
								, {
									text : "Import from pic",
									handler : showImportPanel.createDelegate(
											this, [5])
								}]
					}
				}]
	});
	function rightClickFn(client, rowIndex, e) {
		e.preventDefault();
		rightMenu.showAt(e.getXY());
	}
	grid.on("rowcontextmenu", rightClickFn);

	// 右边隐藏的字段
	var hiddenItemsRight = new Ext.Panel({
				layout : 'form',
				hidden : true,
				items : [typeLv1Box, eleFlagBox, {
							xtype : "numberfield",
							fieldLabel : "套数",
							anchor : "100%",
							id : "eleUnitNum",
							name : "eleUnitNum",
							disabledClass : 'combo-disabled',
							tabIndex : 37,
							decimalPrecision : 0,
							maxValue : 1000000000
						}, typeLv2Box, {
							xtype : "numberfield",
							fieldLabel : "模具费用",
							anchor : "100%",
							tabIndex : 43,
							decimalPrecision : 3,
							id : "moldCharge",
							name : "moldCharge",
							maxValue : 99999.999
						}, {
							xtype : "textfield",
							fieldLabel : "所属年份",
							anchor : "100%",
							id : "eleTypenameLv2",
							name : "eleTypenameLv2",
							tabIndex : 44,
							maxLength : 20
						}, {
							xtype : "numberfield",
							fieldLabel : "容积",
							anchor : "100%",
							tabIndex : 45,
							id : "cube",
							name : "cube",
							decimalPrecision : 2,
							maxValue : 999999.99
						}, {
							xtype : "textarea",
							fieldLabel : "产品描述",
							anchor : "100%",
							tabIndex : 48,
							height : 40,
							id : "eleDesc",
							name : "eleDesc",
							maxLength : 500
						}, eleHsidBox, inputGridTypeIdBox, {
							xtype : "numberfield",
							fieldLabel : "中盒装数",
							anchor : "100%",
							tabIndex : 62,
							id : "boxMbCount",
							name : "boxMbCount",
							decimalPrecision : 0,
							maxValue : 1000000000
						}, boxMbTypeBox, {
							xtype : "numberfield",
							fieldLabel : "CUFT",
							anchor : "100%",
							tabIndex : 69,
							id : "boxCuft",
							name : "boxCuft",
							decimalPrecision : 4,
							maxValue : 999999999.999999,
							listeners : {
								"change" : calCbmCube
							}
						}, {
							xtype : "numberfield",
							fieldLabel : "摆放方式",
							anchor : "100%",
							id : "putL",
							name : "putL",
							tabIndex : 72,
							decimalPrecision : 2,
							maxValue : 999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 73,
							id : "putW",
							name : "putW",
							decimalPrecision : 2,
							maxValue : 999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 74,
							id : "putH",
							name : "putH",
							decimalPrecision : 2,
							maxValue : 999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "INCH",
							anchor : "100%",
							labelSeparator : ":",
							tabIndex : 78,
							id : "boxLInch",
							name : "boxLInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 79,
							id : "boxWInch",
							name : "boxWInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 80,
							id : "boxHInch",
							name : "boxHInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "INCH",
							anchor : "100%",
							labelSeparator : ":",
							tabIndex : 84,
							id : "boxPbLInch",
							name : "boxPbLInch",
							decimalPrecision : 2,
							maxValue : 999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 85,
							id : "boxPbWInch",
							name : "boxPbWInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 86,
							id : "boxPbHInch",
							name : "boxPbHInch",
							decimalPrecision : 2,
							maxValue : 999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "INCH",
							anchor : "100%",
							labelSeparator : ":",
							tabIndex : 90,
							id : "boxIbLInch",
							name : "boxIbLInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 91,
							id : "boxIbWInch",
							name : "boxIbWInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 92,
							id : "boxIbHInch",
							name : "boxIbHInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "中盒包装CM",
							anchor : "100%",
							tabIndex : 93,
							id : "boxMbL",
							name : "boxMbL",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "INCH",
							anchor : "100%",
							labelSeparator : ":",
							tabIndex : 96,
							id : "boxMbLInch",
							name : "boxMbLInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 94,
							id : "boxMbW",
							name : "boxMbW",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 97,
							id : "boxMbWInch",
							name : "boxMbWInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 95,
							id : "boxMbH",
							name : "boxMbH",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 98,
							id : "boxMbHInch",
							name : "boxMbHInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "INCH",
							anchor : "100%",
							labelSeparator : ":",
							tabIndex : 102,
							id : "boxObLInch",
							name : "boxObLInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 103,
							id : "boxObWInch",
							name : "boxObWInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "x",
							anchor : "100%",
							labelSeparator : " ",
							tabIndex : 104,
							id : "boxObHInch",
							name : "boxObHInch",
							decimalPrecision : 4,
							maxValue : 9999.9999
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 53,
							id : "packingPrice",
							name : "packingPrice",
							decimalPrecision : 3,
							maxValue : 9999999.999
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 55,
							id : "inputGridPrice",
							name : "inputGridPrice",
							decimalPrecision : 2,
							maxValue : 99999999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 58,
							id : "boxPbPrice",
							name : "boxPbPrice",
							decimalPrecision : 2,
							maxValue : 99999999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 61,
							id : "boxIbPrice",
							name : "boxIbPrice",
							decimalPrecision : 2,
							maxLength : 99999999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 64,
							id : "boxMbPrice",
							name : "boxMbPrice",
							decimalPrecision : 2,
							maxValue : 99999999.99
						}, {
							xtype : "numberfield",
							fieldLabel : "价",
							anchor : "100%",
							tabIndex : 67,
							id : "boxObPrice",
							name : "boxObPrice",
							decimalPrecision : 2,
							maxLength : 99999999.99
						}, {
							xtype : "textarea",
							fieldLabel : "中文规格",
							anchor : "100%",
							height : 40,
							tabIndex : 105,
							id : "eleSizeDesc",
							name : "eleSizeDesc",
							maxLength : 500
						}, {
							xtype : "textarea",
							fieldLabel : "口径描述",
							anchor : "100%",
							height : 40,
							tabIndex : 107,
							id : "boxTDesc",
							name : "boxTDesc",
							maxLength : 200
						}, {
							xtype : "textarea",
							fieldLabel : "底径描述",
							anchor : "100%",
							height : 40,
							tabIndex : 108,
							id : "boxBDesc",
							name : "boxBDesc",
							maxLength : 200
						}, {
							xtype : "textarea",
							fieldLabel : "英文包装",
							anchor : "100%",
							height : 40,
							tabIndex : 109,
							id : "boxRemark",
							name : "boxRemark",
							maxLength : 500
						}, {
							xtype : 'textfield',
							fieldLabel : '平均价',
							disabled : true,
							disabledClass : 'combo-disabled',
							id : "avgPrice",
							anchor : "98%",
							name : "avgPrice"
						}, {
							xtype : 'textfield',
							fieldLabel : '最低价',
							disabled : true,
							disabledClass : 'combo-disabled',
							id : "minPrice",
							anchor : "98%",
							name : "minPrice"
						}, {
							xtype : 'textfield',
							fieldLabel : '最高价',
							disabled : true,
							disabledClass : 'combo-disabled',
							id : "maxPrice",
							anchor : "98%",
							name : "maxPrice"
						}, {
							xtype : 'textfield',
							fieldLabel : '最新价',
							disabled : true,
							disabledClass : 'combo-disabled',
							id : "newPrice",
							anchor : "95%",
							name : "newPrice"
						}, {
							xtype : 'textfield',
							fieldLabel : '原始外销价',
							disabled : true,
							disabledClass : 'combo-disabled',
							id : "oldPrice",
							anchor : "98%",
							name : "oldPrice"
						}]
			});

	// 右边折叠表单
	var rightForm = new Ext.form.FormPanel({
		autoScroll : true,
		border : false,
		padding : "5px",
		labelWidth : 90,
		layout : "form",
		labelAlign : "right",
		items : [{
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
				xtype : "panel",
				columnWidth : 0.4,
				layout : 'hbox',
				layoutConfig : {
					align : 'middle',
					pack : 'center'
				},
				buttonAlign : "center",
				items : [{
					xtype : "panel",
					width : 100,
					html : '<div align="center" style="width: 100px; height: 100px;">'
							+ '<img src="common/images/zwtp.png"  id="picPath" name="picPath"'
							+ ' onload="javascript:DrawImage(this,100,100)" onclick="showBigPicDiv(this)"/></div>'
				}],
				buttons : [{
					width : 40,
					text : "mod",
					handler : showUploadPanel,
					id : "upmod"
						// iconCls : "upload-icon"
					}, {
					width : 40,
					text : "del",
					handler : delPic,
					id : "updel"
						// iconCls : "upload-icon-del"
					}]
			}, {
				xtype : "panel",
				title : "",
				columnWidth : 0.6,
				layout : "form",
				labelWidth : 80,
				items : [{
							xtype : "textfield",
							fieldLabel : "Art No.",
							anchor : "100%",
							id : "eleId",
							tabIndex : 41,
							name : "eleId"
						}, facBox, {
							xtype : "textfield",
							fieldLabel : "S.A  No.",
							anchor : "100%",
							id : "factoryNo",
							tabIndex : 43,
							name : "factoryNo"
						}, {
							xtype : "textfield",
							fieldLabel : "Cust.A No.",
							anchor : "100%",
							tabIndex : 44,
							id : "custNo",
							name : "custNo"
						}, {
							xtype : "panel",
							title : "",
							layout : "column",
							items : [{
								xtype : "panel",
								layout : "form",
								columnWidth : 1,
								items : [{
									xtype : "textfield",
									fieldLabel : "Barcode",
									anchor : "100%",
									id : "barcode",
									name : "barcode",
									tabIndex : 45,
									maxLength : 30,
									listeners : {
										"render" : function(obj) {
											var tip = new Ext.ToolTip({
												target : obj.getEl(),
												anchor : 'top',
												maxWidth : 160,
												minWidth : 160,
												html : 'Click the right button to automatically generate the Barcode!'
											});
										}
									}
								}]
							}, {
								xtype : "button",
								width : 20,
								text : "",
								cls : "SYSOP_ADD",
								iconCls : "barcode",
								handler : changeBarcode,
								listeners : {
									"render" : function(obj) {
										var tip = new Ext.ToolTip({
											target : obj.getEl(),
											anchor : 'top',
											maxWidth : 160,
											minWidth : 160,
											html : 'Depending on the configuration automatically generated Barcode!'
										});
									}
								}
							}]
						}, {
							xtype : "hidden",
							id : "id",
							name : "id"
						}, {
							xtype : "hidden",
							id : "rdm",
							name : "rdm"
						}]
			}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "textfield",
									fieldLabel : "Unit",
									anchor : "100%",
									tabIndex : 46,
									id : "eleUnit",
									name : "eleUnit"
								}, sourceBox, {
									xtype : "numberfield",
									fieldLabel : "Weight(g)",
									anchor : "100%",
									tabIndex : 50,
									id : "boxWeigth",
									name : "boxWeigth"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "textfield",
									fieldLabel : "Level",
									anchor : "100%",
									tabIndex : 47,
									id : "eleGrade",
									name : "eleGrade"
								}, {
									xtype : "textfield",
									fieldLabel : "MOQ",
									anchor : "100%",
									tabIndex : 49,
									id : "eleMod",
									name : "eleMod"
								}, {
									xtype : "panel",
									title : "",
									layout : "column",
									items : [{
										xtype : "panel",
										title : "",
										columnWidth : 0.75,
										layout : "form",
										items : [{
													xtype : "numberfield",
													fieldLabel : "N.W/G.W(kgs)",
													anchor : "100%",
													tabIndex : 51,
													id : "boxNetWeigth",
													name : "boxNetWeigth"
												}]
									}, {
										xtype : "panel",
										title : "",
										columnWidth : 0.25,
										layout : "form",
										items : [{
													xtype : "numberfield",
													fieldLabel : "标签",
													anchor : "100%",
													hideLabel : true,
													tabIndex : 52,
													id : "boxGrossWeigth",
													name : "boxGrossWeigth"
												}]
									}]
								}]
					}]
		}, {
			xtype : "textarea",
			fieldLabel : "Description",
			anchor : "95%",
			height : 35,
			tabIndex : 53,
			id : "eleNameEn",
			name : "eleNameEn"
		}, {
			xtype : "textarea",
			fieldLabel : "Material",
			anchor : "95%",
			height : 35,
			tabIndex : 54,
			id : "eleName",
			name : "eleName"
		}, {
			xtype : "textarea",
			fieldLabel : "Color",
			anchor : "95%",
			height : 35,
			tabIndex : 55,
			id : "eleCol",
			name : "eleCol"
		}, {
			xtype : "textarea",
			fieldLabel : "Remarks",
			anchor : "95%",
			height : 35,
			tabIndex : 56,
			id : "eleRemark",
			name : "eleRemark"
		}, {
			xtype : "textarea",
			fieldLabel : "Size Description",
			anchor : "95%",
			height : 35,
			tabIndex : 57,
			id : "eleInchDesc",
			name : "eleInchDesc"
		}, {
			xtype : "textarea",
			fieldLabel : "Packing Description",
			anchor : "95%",
			height : 35,
			tabIndex : 58,
			id : "boxRemarkCn",
			name : "boxRemarkCn"
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "numberfield",
									fieldLabel : "Product Size",
									anchor : "100%",
									tabIndex : 60,
									id : "boxL",
									name : "boxL"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "numberfield",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 61,
									id : "boxW",
									name : "boxW"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "numberfield",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 62,
									id : "boxH",
									name : "boxH"
								}]
					}]
		}, boxPacking, {
			xtype : "panel",
			title : "",
			hidden : true,
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "hidden",
									fieldLabel : "Packing",
									anchor : "100%",
									tabIndex : 64,
									id : "boxPbCount",
									name : "boxPbCount"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [boxPbTypeBox]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						hidden : true,
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "hidden",
									fieldLabel : "Packing Size",
									anchor : "100%",
									tabIndex : 66,
									id : "boxPbL",
									name : "boxPbL"
								}]
					}, {
						xtype : "panel",
						title : "",
						hidden : true,
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "hidden",
									fieldLabel : "*",
									anchor : "100%",
									hideLabel : false,
									labelSeparator : " ",
									tabIndex : 67,
									id : "boxPbW",
									name : "boxPbW"
								}]
					}, {
						xtype : "panel",
						title : "",
						hidden : true,
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "hidden",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 68,
									id : "boxPbH",
									name : "boxPbH"
								}]
					}]
		}, {
			xtype : "panel",
			title : "",
			hidden : true,
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "hidden",
									fieldLabel : "Inner Packing",
									anchor : "100%",
									tabIndex : 69,
									id : "boxIbCount",
									name : "boxIbCount"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [boxIbTypeBox]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			hidden : true,
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						hidden : true,
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "hidden",
									fieldLabel : "Inner Size",
									anchor : "100%",
									tabIndex : 71,
									id : "boxIbL",
									name : "boxIbL"
								}]
					}, {
						xtype : "panel",
						title : "",
						hidden : true,
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "hidden",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 72,
									id : "boxIbW",
									name : "boxIbW"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.25,
						layout : "form",
						hidden : true,
						labelWidth : 10,
						items : [{
									xtype : "hidden",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 73,
									id : "boxIbH",
									name : "boxIbH"
								}]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "numberfield",
									fieldLabel : "Outer Carton",
									anchor : "100%",
									tabIndex : 74,
									id : "boxObCount",
									name : "boxObCount"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [boxObTypeBox]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "numberfield",
									fieldLabel : "Carton Size",
									anchor : "100%",
									tabIndex : 76,
									id : "boxObL",
									name : "boxObL"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "numberfield",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 77,
									id : "boxObW",
									name : "boxObW"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.25,
						layout : "form",
						labelWidth : 10,
						items : [{
									xtype : "numberfield",
									fieldLabel : "*",
									anchor : "100%",
									labelSeparator : " ",
									tabIndex : 78,
									id : "boxObH",
									name : "boxObH"
								}]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "numberfield",
									fieldLabel : "20' Container",
									anchor : "100%",
									tabIndex : 79,
									id : "box20Count",
									name : "box20Count"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						labelWidth : 100,
						items : [{
									xtype : "numberfield",
									fieldLabel : "40' Container",
									anchor : "100%",
									tabIndex : 80,
									id : "box40Count",
									name : "box40Count"
								}]
					}]
		}, {
			xtype : "panel",
			title : "",
			anchor : '95%',
			layout : "column",
			items : [{
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						items : [{
									xtype : "numberfield",
									fieldLabel : "45' Container",
									anchor : "100%",
									tabIndex : 81,
									id : "box45Count",
									name : "box45Count"
								}]
					}, {
						xtype : "panel",
						title : "",
						columnWidth : 0.5,
						layout : "form",
						labelWidth : 100,
						items : [{
									xtype : "numberfield",
									fieldLabel : "40 HC Container",
									anchor : "100%",
									tabIndex : 82,
									id : "box40hqCount",
									name : "box40hqCount"
								}]
					}]
		}, hiddenItemsRight]
	});

	// 右边折叠面板
	var rightPanel = new Ext.Panel({
		title : 'DETAIL',
		layout : 'fit',
		frame : true,
		border : false,
		region : 'east',
		width : "30%",
		collapsible : true,
		collapsed : true,
		listeners : {
			'beforeadd' : function(pnl, component, index) {
				pnl.getEl().mask("Loading, please wait ...", 'x-mask-loading');
			},
			'afterlayout' : function(pnl) {
				pnl.getEl().unmask();
				// 获取sm选择行
				var selectRec = sm.getSelected();
				if (selectRec != null) {
					initForm(selectRec);
				}
				// 给表单加事件
				var items = rightForm.getForm().items;
				for (var i = 0; i < items.getCount(); i++) {
					var item = items.get(i);
					// 去掉无名的和一些下拉框
					if (!item.getName())
						continue;
					item.on('change', function(txt, newVal, oldVal) {
						if ($('rdm').value != "") {
							DWREngine.setAsync(false);
							updateMapValue($('rdm').value, txt.getName(),
									newVal);
							DWREngine.setAsync(true);
							// 修改表格数据,如果表格没有这一列,则修改这一行的状态
							ds.each(function(rec) {
										if (rec.data.rdm == $('rdm').value) {
											var cell = rec.data[txt.getName()];
											if (typeof(cell) == 'undefined') {
												if (!isNaN(rec.data.id)) {
													var temp = rec.data.rdm;
													rec
															.set(
																	"rdm",
																	temp
																			+ "aaa");
													rec.set("rdm", temp);
													// rec.dirty = true;
													// ds.afterEdit(rec);
												}
											} else {
												rec.set(txt.getName(), newVal);
											}
											return false;
										}
									});
							// 中英文规格的转换
							if (txt.getName() == 'boxL'
									|| txt.getName() == 'boxW'
									|| txt.getName() == 'boxH'
									|| txt.getName() == 'boxPbL'
									|| txt.getName() == 'boxPbW'
									|| txt.getName() == 'boxPbH'
									|| txt.getName() == 'boxIbL'
									|| txt.getName() == 'boxIbW'
									|| txt.getName() == 'boxIbH'
									|| txt.getName() == 'boxMbL'
									|| txt.getName() == 'boxMbW'
									|| txt.getName() == 'boxMbH'
									|| txt.getName() == 'boxObL'
									|| txt.getName() == 'boxObW'
									|| txt.getName() == 'boxObH') {
								calInch(txt, newVal, oldVal);
							}
							if (txt.getName() == 'boxObL') {
								changeBoxObL(newVal, true);
							}
							if (txt.getName() == 'boxObW') {
								changeBoxObW(newVal, true);
							}
							if (txt.getName() == 'boxObH') {
								changeBoxObH(newVal, true);
							}
							// 更改表格的退税率,和单价和利润率
							if (txt.getName() == 'eleHsid') {
								if (newVal != '') {
									setTuiLv(newVal);
								}
							}
							if (txt.getName() == 'boxLInch'
									|| txt.getName() == 'boxWInch'
									|| txt.getName() == 'boxHInch'
									|| txt.getName() == 'boxPbLInch'
									|| txt.getName() == 'boxPbWInch'
									|| txt.getName() == 'boxPbHInch'
									|| txt.getName() == 'boxIbLInch'
									|| txt.getName() == 'boxIbWInch'
									|| txt.getName() == 'boxIbHInch'
									|| txt.getName() == 'boxMbLInch'
									|| txt.getName() == 'boxMbWInch'
									|| txt.getName() == 'boxMbHInch'
									|| txt.getName() == 'boxObLInch'
									|| txt.getName() == 'boxObWInch'
									|| txt.getName() == 'boxObHInch') {
								calCm(txt, newVal, oldVal);
							}
							if (txt.getName() == 'boxObLInch') {
								changeBoxObL(Number(newVal).mul(2.54), true, 1);
							}
							if (txt.getName() == 'boxObWInch') {
								changeBoxObW(Number(newVal).mul(2.54), true, 1);
							}
							if (txt.getName() == 'boxObHInch') {
								changeBoxObH(Number(newVal).mul(2.54), true, 1);
							}
							// 某些计算包材价格的字段触发calPrice()
							if (txt.getName() == 'boxPbCount'
									|| txt.getName() == 'boxIbCount'
									|| txt.getName() == 'boxMbCount'
									|| txt.getName() == 'boxObCount') {
								var rdm = $('rdm').value;
								DWREngine.setAsync(false);
								updateMapValue(rdm, txt.getName(), newVal);
								DWREngine.setAsync(true);
								calPrice();
								// 重新计算数量,装箱数
								if (txt.getName() == 'boxObCount') {

								}
							}
							// 手动修改各个价格时
							if (txt.getName() == 'boxPbPrice'
									|| txt.getName() == 'boxIbPrice'
									|| txt.getName() == 'boxMbPrice'
									|| txt.getName() == 'boxObPrice'
									|| txt.getName() == 'inputGridPrice') {
								calPackPriceAndPriceFac();
							}
							// 手动修改单个价格时
							if (txt.getName() == 'packingPrice') {
								calPriceByPakingPrice(newVal);
							}
						}
					});
				}
			},
			'expand' : function(pnl) {
				if (!rightForm.isVisible()) {
					pnl.add(rightForm);
				}
			}
		},
		items : []
	});

	// 组成方式
	var sortStore = new Ext.data.SimpleStore({
				fields : ["tp", "name"],
				data : [[0, '升序'], [1, '降序']]
			});
	var sortComb = new Ext.form.ComboBox({
				name : 'sortSel',
				tabIndex : 4,
				fieldLabel : '方式',
				emptyText : 'Choose',
				store : sortStore,
				value : 0,
				valueField : "tp",
				displayField : "name",
				mode : 'local',
				validateOnBlur : true,
				triggerAction : 'all',
				width : 60,
				flex : 1,
				hiddenName : 'sortSel',
				selectOnFocus : true
			});

	var additional = new Ext.form.FormPanel({
		title : "",
		labelWidth : 100,
		labelAlign : "right",
		layout : "form",
		autoScroll : true,
		padding : "5px",
		frame : true,
		items : [{
			xtype : "fieldset",
			title : "Additional Information",
			layout : "column",
			anchor : '98%',
			items : [{
				xtype : "panel",
				title : "",
				columnWidth : 0.5,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Quality",
					anchor : "100%",
					id : 'quality',
					name : 'quality',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.quality);
							}
						}
					}
				}]
			}, {
				xtype : "panel",
				title : "",
				columnWidth : 0.5,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Colours & Design",
					anchor : "100%",
					id : 'colours',
					name : 'colours',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.colours);
							}
						}
					}
				}]
			}]
		}, {
			xtype : "fieldset",
			title : "Packing",
			layout : "column",
			anchor : '98%',
			items : [{
				xtype : "panel",
				title : "",
				columnWidth : 0.5,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Sale Unit",
					anchor : "100%",
					id : 'saleUnit',
					name : 'saleUnit',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.saleUnit);
							}
						}
					}
				}, {
					xtype : "textarea",
					fieldLabel : "Packing Assortment",
					anchor : "100%",
					id : 'assortment',
					name : 'assortment',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.assortment);
							}
						}
					}
				}]
			}, {
				xtype : "panel",
				title : "",
				columnWidth : 0.5,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Handle Unit",
					anchor : "100%",
					id : 'handleUnit',
					name : 'handleUnit',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.handleUnit);
							}
						}
					}
				}, {
					xtype : "textarea",
					fieldLabel : "Comments",
					anchor : "100%",
					id : 'comments',
					name : 'comments',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.comments);
							}
						}
					}
				}]
			}, {
				xtype : "panel",
				title : "",
				columnWidth : 1,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Shipping Mark",
					anchor : "100%",
					id : 'shippingMark',
					name : 'shippingMark',
					maxLength : 500,
					height : 75,
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.shippingMark);
							}
						}
					}
				}]
			}]
		}, {
			xtype : "fieldset",
			title : "Buyer/Seller/Agent",
			layout : "column",
			anchor : '98%',
			items : [{
				xtype : "panel",
				title : "",
				columnWidth : 0.33,
				layout : 'column',
				labelWidth : 30,
				labelAlign : "left",
				items : [{
					xtype : 'panel',
					style : 'padding-left:60px',
					columnWidth : 0.2,
					items : [{
						xtype : 'checkbox',
						name : 'isCheckAgent',
						id : 'isCheckAgent',
						listeners : {
							'afterrender' : function() {
								var checked = txtAreaAry.isCheckAgent;
								Ext.getCmp('isCheckAgent').setValue(checked);
								if (checked == '1') {
									Ext.getCmp('commisionScalePanel')
											.setVisible(true);
								} else {
									Ext.getCmp('commisionScalePanel')
											.setVisible(false);
								}
							},
							'check' : function(check, bo) {
								// 验证表单
								var formData = getFormValues(orderForm, true);
								// 表单验证失败时,返回
								if (!formData) {
									check.setValue(0);
									return;
								}
								if (bo == true) {
									txtAreaAry.isCheckAgent = '1';
									Ext.getCmp('commisionScalePanel')
											.setVisible(true);
									var custId = custBox.getValue();
									if (Ext.isEmpty(custId)) {
										Ext.MessageBox.alert("Message",
												"Please select Customer first");
										return;
									} else {
										cotCustomerService.getCustomerById(
												custId, function(res) {
													if (res != null) {
														var city = '';
														var nation = '';
														var fullName = '';
														var post='';
														var adr = '';
														if (!Ext
																.isEmpty(res.fullNameEn)) {
															fullName = res.fullNameEn
																	+ ',\n'
														}
														if (!Ext
																.isEmpty(res.customerAddrEn)) {
															adr = res.customerAddrEn
																	+ ',\n'
														}
														if(!Ext.isEmpty(res.customerPost)){
															post= res.customerPost+','
														}
														if (!Ext
																.isEmpty(cityMap[res.cityId])) {
															city = cityMap[res.cityId]
																	+ ',\n'
														}
														if (!Ext
																.isEmpty(nationMap[res.nationId])) {
															nation = nationMap[res.nationId];
														}
														var str = fullName + adr + post+city + nation;
														var start = str
																.indexOf(',');
														var end = str
																.lastIndexOf(',');
														var strLength=str.length-2;
														if (start == end) {
															if(start==strLength){
																str=str.substring(0,strLength);
															}
														} else {
															str = str
																	.substring(
																			0,
																			end);
														}
														Ext.getCmp('buyer')
																.setValue(str);
													}
												});
										Ext.getCmp('agent')
												.setValue('Wolly & Co,\n'
														+ 'Hovedgaden 2,\n'
														+ '4330 Hvalsø,\n'
														+ 'Denmark');
										var facId = factoryBox.getValue();
										if (Ext.isEmpty(facId)) {
											Ext.MessageBox
													.alert("Message",
															"Please select Supplier first");
											
										} else {
											cotFactoryService.getFactoryById(
													facId, function(res) {
														if (res != null) {
															// TODO:
															var city = '';
															var nation = '';
															var fullName = '';
															var post='';
															var adr = '';
															if (!Ext
																	.isEmpty(res.post)) {
																fullName = res.post
																		+ ',\n'
															}
															if(!Ext.isEmpty(res.customerPost)){
																post= res.customerPost+','
															}
															if (!Ext
																	.isEmpty(res.factoryAddr)) {
																adr = res.factoryAddr
																		+ ',\n'
															}
															if (!Ext
																	.isEmpty(cityMap[res.cityId])) {
																city = cityMap[res.cityId]
																		+ ',\n'
															}
															if (!Ext
																	.isEmpty(nationMap[res.nationId])) {
																nation = nationMap[res.nationId];
															}
															var str = fullName + adr + post+city + nation;
															var start = str
																	.indexOf(',');
															var end = str
																	.lastIndexOf(',');
															var strLength=str.length-2;
															if (start == end) {
																if(start==strLength){
																	str=str.substring(0,strLength);
																}
															} else {
																str = str
																		.substring(
																				0,
																				end);
															}
															Ext
																	.getCmp('seller')
																	.setValue(str);
														}
													});
										}
									}

								} else {
									txtAreaAry.isCheckAgent = '0';
									Ext.getCmp('commisionScalePanel')
											.setVisible(false);
									Ext.getCmp('agent').setValue('      ');

									// 客户
									var custId = custBox.getValue();
									if (Ext.isEmpty(custId)) {
										Ext.MessageBox.alert("Message",
												"Please select Customer first");
										return;
									} else {
										$(seller).value = 'Wolly & Co,\n'
												+ 'Hovedgaden 2,\n'
												+ '4330 Hvalsø,\n' + 'Denmark';
									}
								}
							}

						}
					}]
				}, {
					columnWidth : 0.8,
					layout : 'form',
					items : [{
						xtype : "textarea",
						fieldLabel : 'Agent',
						id : 'agent',
						name : 'agent',
						maxLength : 500,
						height : 75,
						anchor : "100%",
						listeners : {
							'afterrender' : function(area) {
								if ($('pId').value != ''
										&& $('pId').value != 'null') {
									area.setValue(txtAreaAry.agent);
								}
							}
						}
					}]
				}]

			}, {
				xtype : "panel",
				title : "",
				columnWidth : 0.33,
				layout : "form",
				items : [{
					xtype : "textarea",
					// fieldLabel : "<a href='#' onclick='changeBuyer()'
					// title='get Invoice Address form Client'>Buyer</a>",
					fieldLabel : "Buyer",
					id : 'buyer',
					name : 'buyer',
					maxLength : 500,
					height : 75,
					anchor : "100%",
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.buyer);
							}
						}
					}
				}]
			}, {
				xtype : "panel",
				title : "",
				columnWidth : 0.33,
				layout : "form",
				items : [{
					xtype : "textarea",
					fieldLabel : "Seller",
					id : 'seller',
					height : 75,
					name : 'seller',
					maxLength : 500,
					anchor : "100%",
					listeners : {
						'afterrender' : function(area) {
							if ($('pId').value != ''
									&& $('pId').value != 'null') {
								area.setValue(txtAreaAry.seller);
							} else {
								//TODO:
								area.setValue('Wolly & Co,\n'
										+ 'Hovedgaden 2,\n' + '4330 Hvalsø,\n'
										+ 'Denmark');
							}
						}
					}
				}]
			}]
		}]
	});

	// 隐藏的字段
	var hiddenItems = new Ext.Panel({
				layout : 'form',
				hidden : true,
				items : [{
							xtype : "numberfield",
							fieldLabel : "FOB费用",
							anchor : "100%",
							id : "orderFob",
							name : "orderFob",
							maxValue : 999999.99,
							tabIndex : 14,
							allowDecimals : false,
							allowBlank : true,
							listeners : {
								"change" : function(txt, newVal, oldVal) {
									priceBlur();
								}
							}
						}, {
							xtype : "numberfield",
							fieldLabel : "海运费",
							anchor : "100%",
							id : "orderCharge",
							name : "orderCharge",
							maxValue : 999999.99,
							tabIndex : 15,
							allowBlank : true,
							listeners : {
								"change" : function(txt, newVal, oldVal) {
									priceBlur();
								}
							}
						}, commisionBox, {
							xtype : "numberfield",
							fieldLabel : "比例%",
							anchor : "100%",
							// id : "commisionScale",
							// name : "commisionScale",
							tabIndex : 17,
							maxValue : 999.99,
							allowBlank : true,
							listeners : {
								"change" : commisionScaleChange
							}
						}, {
							xtype : "numberfield",
							fieldLabel : "保险费‰",
							anchor : "100%",
							id : "insureRate",
							name : "insureRate",
							tabIndex : 18,
							maxValue : 999.99,
							allowBlank : true,
							listeners : {
								"change" : function(txt, newVal, oldVal) {
									priceBlur();
								}
							}
						}, {
							xtype : "numberfield",
							fieldLabel : "加成率%",
							anchor : "100%",
							id : "insureAddRate",
							name : "insureAddRate",
							tabIndex : 19,
							maxValue : 999.99,
							allowBlank : true,
							listeners : {
								"change" : function(txt, newVal, oldVal) {
									priceBlur();
								}
							}
						}, zheBox, {
							xtype : "numberfield",
							fieldLabel : "溢短率",
							anchor : "100%",
							id : "shortRate",
							name : "shortRate",
							maxValue : 999.99,
							tabIndex : 23,
							allowBlank : true
						}, {
							xtype : "textfield",
							fieldLabel : "信用证号",
							anchor : "100%",
							id : "creditNo",
							name : "creditNo",
							tabIndex : 25,
							maxLength : 100,
							allowBlank : true
						}, trafficBox, {
							xtype : "numberfield",
							fieldLabel : "保险费‰",
							anchor : "100%",
							id : "insureRate",
							name : "insureRate",
							tabIndex : 18,
							maxValue : 999.99,
							allowBlank : true,
							listeners : {
								"change" : function(txt, newVal, oldVal) {
									priceBlur();
								}
							}
						}, {
							xtype : "textfield",
							fieldLabel : "交期说明",
							anchor : "100%",
							id : "orderDesc",
							name : "orderDesc",
							tabIndex : 30,
							maxLength : 500,
							allowBlank : true
						}, bankBox, {
							xtype : "textfield",
							fieldLabel : "条款组合",
							anchor : "100%",
							id : "orderCompose",
							name : "orderCompose",
							maxLength : 100,
							tabIndex : 22,
							allowBlank : true
						}]
			});

	// 判断单号是否重复参数
	var isExist = true;
	var orderForm = new Ext.form.FormPanel({
		title : "Base Information-(Red is required)",
		labelWidth : 90,
		formId : "orderForm",
		collapsible : true,
		labelAlign : "right",
		region : 'north',
		layout : "column",
		width : "100%",
		height : 200,
		// frame : true,
		border : false,
		bodyStyle : 'background:#dfe8f6',
		ctCls : 'x-panel-mc',
		padding : 8,
		listeners : {
			'collapse' : function(pnl) {
				Ext.Element.fly("talPriceDiv").setLeftTop(620, 35);
			},
			'expand' : function(pnl) {
				Ext.Element.fly("talPriceDiv").setLeftTop(620, 205);
			}
		},
		items : [{
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					labelWidth : 100,
					items : [custBox, factoryBox, shipPortBox, {
								xtype : "datefield",
								fieldLabel : "<font color=red>Date</font>",
								anchor : "100%",
								format : "Y-m-d H:i:s",
								id : "orderTime",
								name : "orderTime",
								value : new Date(),
								hidden : true,
								hideLabel : true,
								tabIndex : 16,
								// vtype : 'daterange',
								// endDateField : 'sendTime',
								listeners : {
									'select' : function(field, date) {
										var dt = new Date(date);
										var date = dt.format('Y-m-d');
										var dt2 = new Date();
										var time = dt2.format('H:i:s');
										field.setValue(date + " " + time);
									}
								}
							}, contactBox, {
								xtype : "datefield",
								fieldLabel : "Date",
								anchor : "100%",
								format : "Y-m-d H:i:s",
								id : "addTime",
								name : "addTime",
								value : new Date(),
								tabIndex : 21,
								disabled : true,
								disabledClass : 'combo-disabled'
							}]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					labelWidth : 120,
					items : [{
						xtype : "panel",
						layout : "column",
						anchor : "100%",
						items : [{
							xtype : "panel",
							layout : "form",
							columnWidth : 1,
							items : [{
								xtype : "textfield",
								fieldLabel : "<font color=red>W&C P/I</font>",
								anchor : "100%",
								id : "orderNo",
								tabIndex : 2,
								readOnly:true,
								blankText : "Please enter W&C P/I!",
								name : "orderNo",
								maxLength : 100,
								allowBlank : false,
								invalidText : "W&C P/I already exists, enter the new!",
								validationEvent : 'change',
								validator : function(thisText) {
									if (thisText != '') {
										cotOrderService.findIsExistOrderNo(
												thisText, $('pId').value,
												function(res) {
													if (res) {
														isExist = false;
													} else {
														isExist = true;
													}
												});
									}
									return isExist;
								},
								listeners : {
									"render" : function(obj) {
										var tip = new Ext.ToolTip({
											target : obj.getEl(),
											anchor : 'top',
											maxWidth : 160,
											minWidth : 160,
											html : 'Click the right button to automatically generate the W&C P/I!'
										});
									}
								}
							}]
						}, {
							xtype : "button",
							width : 20,
							text : "",
							cls : "SYSOP_ADD",
							iconCls : "cal",
							handler : getOrderNo,
							listeners : {
								"render" : function(obj) {
									var tip = new Ext.ToolTip({
										target : obj.getEl(),
										anchor : 'top',
										maxWidth : 160,
										minWidth : 160,
										html : 'Depending on the configuration automatically generated W&C P/I!'
									});
								}
							}
						}]
					}, curBox, targetPortBox, {
						xtype : "datefield",
						fieldLabel : "<font color=red>Shipment</font>",
						anchor : "100%",
						allowBlank : false,
						blankText : "Please enter the Shipment!",
						tabIndex : 17,
						format : "Y-m-d",
						id : "orderLcDate",
						name : "orderLcDate",
						listeners : {
							'select' : function(com, tx) {
								Ext.getCmp('sendTime').setValue(tx.add(
										Date.DAY, 40));
							}
						}
					}, addEmpBox]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					items : [{
								xtype : "textfield",
								fieldLabel : "ClientP/O",
								anchor : "100%",
								id : "poNo",
								name : "poNo",
								tabIndex : 3
							}, {
								xtype : "numberfield",
								fieldLabel : "<font color=red>Rate</font>",
								anchor : "100%",
								hideLabel : true,
								hidden : true,
								id : "orderRate",
								name : "orderRate",
								maxValue : 999.99,
								tabIndex : 8,
								// allowBlank : false,
								// blankText : "Please enter the exchange
								// rate!",
								listeners : {
									"change" : function(txt, newVal, oldVal) {
										priceBlur();
									}
								}
							}, {
								xtype : "numberfield",
								fieldLabel : "TotalCBM",
								anchor : "100%",
								id : "orderEarnest",
								name : "orderEarnest",
								tabIndex : 25
							}, containerBox, {
								xtype : "datefield",
								fieldLabel : "Delivery Date",
								anchor : "100%",
								format : "Y-m-d",
								id : "sendTime",
								name : "sendTime"
							}, {
								xtype : "datefield",
								fieldLabel : "Revise Date",
								anchor : "100%",
								format : "Y-m-d H:i:s",
								id : "modTime",
								name : "modTime",
								tabIndex : 22,
								disabled : true,
								disabledClass : 'combo-disabled'
							}]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					items : [empBox, {
								xtype : "numberfield",
								fieldLabel : "Profit(%)",
								anchor : "100%",
								id : "orderProfit",
								name : "orderProfit",
								tabIndex : 9,
								listeners : {
									"change" : function(txt, newVal, oldVal) {
										priceBlur();
									}
								}
							}, payTypeBox, {
								xtype : "datefield",
								fieldLabel : "ETA",
								anchor : "100%",
								tabIndex : 19,
								format : "Y-m-d",
								id : "orderLcDelay",
								name : "orderLcDelay"
							}, modEmpBox]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					items : [companyBox, {
								xtype : "numberfield",
								fieldLabel : "Disscount(%)",
								anchor : "100%",
								id : "zheNum",
								name : "zheNum",
								tabIndex : 10
							}, clauseBox, {
								xtype : "textfield",
								fieldLabel : "<font color=red>Product</font>",
								anchor : "100%",
								allowBlank:false,
								blankText : "Please enter Product!",
								id : "allPinName",
								name : "allPinName",
								tabIndex : 20
							}, empChkBox]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.6,
					layout : "form",
					labelWidth : 100,
					items : [{
								xtype : "textarea",
								fieldLabel : "Comments",
								anchor : "100%",
								id : "orderRemark",
								name : "orderRemark",
								tabIndex : 26,
								height : 25
							}]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					layout : "form",
					labelWidth : 90,
					items : [shenBox]
				}, {
					xtype : "panel",
					title : "",
					columnWidth : 0.2,
					id : 'commisionScalePanel',
					hidden : true,
					layout : "form",
					labelWidth : 90,
					items : [{
								xtype : 'numberfield',
								allowNegative : false,
								anchor : '100%',
								name : 'commisionScale',
								id : 'commisionScale',
								// hidden:true,
								// hideLabel:true,
								// hidden: txtAreaAry.isCheckAgent=='1'?false
								// :true,
								// hideLabel: txtAreaAry.isCheckAgent=='1'?false
								// :true,
								fieldLabel : 'Commision(%)'
							}]
				}, hiddenItems]
	});

	// 第一页
	var centerPanel = new Ext.Panel({
				layout : 'border',
				title : "Invoice Details",
				bodyStyle : 'background:#dfe8f6',
				items : [grid, rightPanel]
			});

	// 产品标图片
	var productPicPanel = new Ext.Panel({
		layout : 'anchor',
		region : 'west',
		width : 300,
		border : false,
		items : [{
			xtype : "panel",
			// bodyStyle : 'padding-left:25px',
			title : "Lable Pic",
			anchor : "100% 50%",
			layout : "hbox",
			labelWidth : 60,
			frame : true,
			layoutConfig : {
				padding : '5',
				pack : 'center',
				align : 'middle'
			},
			// buttons : [{
			// text : '',
			// hidden : true
			// }],
			items : [{
				xtype : "panel",
				width : 160,
				bodyStyle : 'padding-left:20px',
				buttonAlign : "center",
				html : '<div align="center" style="width: 120px; height: 120px;">'
						+ '<img src="common/images/zwtp.png" id="product_MB" name="product_MB"'
						+ 'onload="javascript:DrawImage(this,120,120)" onclick="showBigPicDiv(this)"/></div>',
				buttons : [{
							width : 60,
							text : "Change",
							id : "upmodProMai",
							iconCls : "upload-icon",
							handler : showUploadProductPanel
						}, {
							width : 60,
							text : "DEL",
							id : "updelProMai",
							iconCls : "upload-icon-del",
							handler : delProductMBPic
						}],
				listeners : {
					'afterrender' : function(pnl) {
						var id = $('pId').value;
						if (id != 'null' && id != '') {
							$('product_MB').src = "./showPicture.action?flag=productMB&detailId="
									+ id + "&temp=" + Math.random();
						} else {
							Ext.getCmp('upmodProMai').hide();
							Ext.getCmp('updelProMai').hide();
						}
					}
				}
			}]
		}, {
			xtype : "panel",
			// bodyStyle : 'padding-left:25px',
			title : "Marks Picture",
			layout : "hbox",
			anchor : "100% 50%",
			labelWidth : 60,
			frame : true,
			layoutConfig : {
				padding : '5',
				pack : 'center',
				align : 'middle'
			},
			// buttons : [{
			// text : '',
			// hidden : true
			// }],
			items : [{
				xtype : "panel",
				width : 160,
				bodyStyle : 'padding-left:20px',
				buttonAlign : "center",
				html : '<div align="center" style="width: 120px; height: 120px;">'
						+ '<img src="common/images/zwtp.png" id="order_MB" name="order_MB"'
						+ 'onload="javascript:DrawImage(this,120,120)" onclick="showBigPicDiv(this)"/></div>',
				buttons : [{
							width : 60,
							text : "Change",
							id : "upmodMai",
							iconCls : "upload-icon",
							handler : showUploadMaiPanel
						}, {
							width : 60,
							text : "Del",
							id : "updelMai",
							iconCls : "upload-icon-del",
							handler : delMBPic
						}]
			}]
		}]
	});

	// 产品标
	var maiPicPanel = new Ext.Panel({
				layout : 'fit',
				region : 'west',
				width : 300,
				border : false,
				title : "Lable",
				items : [{
							xtype : 'textarea',
							id : "productArea",
							name : "productArea",
							maxLength : 500,
							listeners : {
								'afterrender' : function(area) {
									area.setValue(productArea);
								}
							}
						}]
			});

	// 正册唛信息
	var maiInfoPanel = new Ext.form.FormPanel({
				layout : 'form',
				region : 'center',
				border : false,
				items : [{
					layout : 'hbox',
					anchor : "100% 50%",
					border : false,
					layoutConfig : {
						align : 'stretch'
					},
					items : [{
						title : "Marks",
						flex : 1,
						xtype : 'panel',
						layout : 'fit',
						margins : '0 5 0 0',
						border : false,
						items : [{
							xtype : 'textarea',
							id : "orderZMArea",
							name : "orderZMArea",
							maxLength : 500,
							listeners : {
								'afterrender' : function(area) {
									if ($('pId').value == ''
											|| $('pId').value == 'null') {
										area.setValue(customerZm);
									} else {
										area.setValue(orderZMArea);
									}
								}
							}
						}]
					}, {
						title : "Side Marks",
						flex : 1,
						layout : 'fit',
						border : false,
						xtype : 'panel',
						items : [{
							xtype : 'textarea',
							id : "orderCMArea",
							name : "orderCMArea",
							maxLength : 500,
							listeners : {
								'afterrender' : function(area) {
									if ($('pId').value == ''
											|| $('pId').value == 'null') {
										area.setValue(customerCm);
									} else {
										area.setValue(orderCMArea);
									}
								}
							}
						}]
					}]
				}, {
					layout : 'hbox',
					anchor : "100% 50%",
					border : false,
					layoutConfig : {
						align : 'stretch'
					},
					items : [{
						title : "Middle Marks",
						flex : 1,
						layout : 'fit',
						xtype : 'panel',
						margins : '0 5 0 0',
						border : false,
						items : [{
							xtype : 'textarea',
							id : "orderZHMArea",
							name : "orderZHMArea",
							maxLength : 500,
							listeners : {
								'afterrender' : function(area) {
									if ($('pId').value == ''
											|| $('pId').value == 'null') {
										area.setValue(customerZhm);
									} else {
										area.setValue(orderZHMArea);
									}
								}
							}
						}]
					}, {
						title : "Inner Marks",
						flex : 1,
						layout : 'fit',
						xtype : 'panel',
						border : false,
						items : [{
							xtype : 'textarea',
							id : "orderNMArea",
							name : "orderNMArea",
							maxLength : 500,
							listeners : {
								'afterrender' : function(area) {
									if ($('pId').value == ''
											|| $('pId').value == 'null') {
										area.setValue(customerNm);
									} else {
										area.setValue(orderNMArea);
									}
								}
							}
						}]
					}]
				}]
			});

	var tbMai = new Ext.Toolbar({
				items : [{
							text : "Update to P.O",
							iconCls : "page_add",
							cls : "SYSOP_ADD",
							handler : updateMb
						}, '-']
			});

	// 唛明细
	var tbPanel = new Ext.Panel({
				layout : 'border',
				border : false,
				region : 'center',
				items : [maiPicPanel, maiInfoPanel]
			});

	var maiPanel = new Ext.Panel({
				layout : 'border',
				border : false,
				tbar : tbMai,
				items : [productPicPanel, tbPanel]
			});

	// 底部标签页
	var tbl = new Ext.TabPanel({
				region : 'center',
				width : "100%",
				activeTab : 0,
				items : [centerPanel,
						// {
						// id : "maiTab",
						// name : "maiTab",
						// title : "Mark details",
						// layout : 'fit',
						// items : [maiPanel]
						// },
						{
					id : "additionalTab",
					name : "additionalTab",
					title : "Additional Information",
					layout : 'fit',
					items : [additional]
				}
				// , {
				// xtype : 'iframepanel',
				// title : "Scheduled date",
				// itemId : 'timeInfoRec',
				// frameConfig : {
				// autoCreate : {
				// id : 'timeInfo'
				// }
				// },
				// loadMask : {
				// msg : '数据读取中...'
				// },
				// listeners : {
				// "activate" : function(panel) {
				// loadTimeInfo();
				// }
				// }
				// }
				],
				buttonAlign : 'center',
				buttons : [{
							text : "Save",
							id : 'saveBtn',
							cls : "SYSOP_ADD",
							iconCls : "page_table_save",
							handler : save
						}, {
							text : "Del",
							iconCls : "page_del",
							hidden : true,
							cls : "SYSOP_DEL",
							handler : del
						}, {
							text : "Change Sort",
							hidden : true,
							iconCls : "page_fen",
							handler : showSort
						}, {
							text : "Print",
							iconCls : "page_print",
							cls : "SYSOP_PRINT",
							handler : showPrint
						}, {
							text : "Save AS",
							iconCls : "page_from",
							id : 'saveAsBtn',
							cls : "SYSOP_ADD",
							handler : showModel
						}, {
							text : "Cancel",
							iconCls : "page_cancel",
							handler : function() {
								closeandreflashEC(true, 'orderGrid', false);
							}
						}, {
							text : "Approval",
							hidden : true,
							id : 'qingBtn',
							iconCls : "page_from",
							handler : showShenPnl
						}, {
							text : "Approved",
							hidden : true,
							id : 'guoBtn',
							iconCls : "page_check",
							handler : guoShen
						}, {
							text : "No Pass",
							hidden : true,
							id : 'buBtn',
							iconCls : "page_check_error",
							handler : buShen
						},{
							text : "Approved",
							hidden : true,
							id : 'guoBtn',
							iconCls : "page_check",
							handler : guoShen
						}, {
							text : "Mail",
							hidden : true,
							id : 'showPdfBtn',
							iconCls : "page_excel",
							handler : showPdf
						}]
			});

	// 编辑页面时加载审核原因
	// tbl.on('tabchange', function(tb, pnl) {
	// if (pnl.name == 'maiTab') {
	// // 加载麦标
	// var id = $('pId').value;
	// var custId = $('custId').value;
	// if (id == 'null' || id == '') {
	// if (custId != 'null' && custId != '') {
	// $('order_MB').src = "./showPicture.action?flag=custMb&detailId="
	// + custId;
	// }
	// Ext.getCmp('upmodMai').hide();
	// Ext.getCmp('updelMai').hide();
	// } else {
	// if ($('uploadSuc').value == "1" || $('uploadSuc').value == "") {
	// $('order_MB').src = "./showPicture.action?flag=orderMB&detailId="
	// + id + "&temp=" + Math.random();
	// } else {
	// if (custId != 'null' && custId != '') {
	// $('order_MB').src = "./showPicture.action?flag=custMb&detailId="
	// + custId;
	// }
	// }
	// Ext.getCmp('upmodMai').show();
	// Ext.getCmp('updelMai').show();
	// }
	// }
	// });

	var viewport = new Ext.Viewport({
				layout : 'border',
				items : [tbl, orderForm]
			});
	viewport.doLayout();

	// 加载表格数据
	ds.load({
				params : {
					start : 0,
					limit : 1000
				}
			});
	// window.changeBuyer=function(){
	// var custId = custBox.getValue();
	// if (!Ext.isEmpty(custId)) {
	// cotCustomerService.getCustomerById(custId, function(res) {
	// if (res != null) {
	// Ext.getCmp('buyer')
	// .setValue(res.invoiceShortName
	// + ',\n'
	// + res.invoiceCustomerAddress
	// + ',\n'
	// + cityMap[res.invoiceCityId]
	// + ',\n'
	// + nationMap[res.invoiceCountryId]);
	//													
	// //Ext.getCmp("shippingMark").setValue(res.customerMb);
	// }
	// });
	// }
	// }
	// -------------------------------------方法--------------------------------------------------

	// 单样品利润率
	var liRunCau = '';
	// 审核原因
	var chkReason = "";
	// 合同条款
	// var conArea = "";
	// 实达-付款条款
	var paycontract = "";
	// 实达-要样数量
	var givenNum = "";
	// 实达-要样单位
	var givenUnit = "";
	// 实达-要样日期
	var givenDate = "";
	// 正唛
	var orderZMArea = "";
	// 侧唛
	var orderCMArea = "";
	// 中唛
	var orderZHMArea = "";
	// 内唛
	var orderNMArea = "";
	// 产品标
	var productArea = "";
	// 样品默认配置,是否自动生成产品包装尺寸
	var sizeFollow = 0;

	// 存储主单的10个字段
	var txtAreaAry = {};

	// 是否可出货
	var canOut = 0;

	// 初始化
	function initform() {
		$('talPriceDiv').style.display = 'block';
		DWREngine.setAsync(false);
		// 清空Map
		// cotOrderService.clearMap("order", function(res) {});
		// 加载集装箱的柜体积
		queryService.getContainerCube(function(res) {
					$('con20').value = res[0];
					$('con40').value = res[1];
					$('con40H').value = res[2];
					$('con45').value = res[3];
				});
		cotElementsService.getDefaultList(function(res) {
					if (res.length != 0) {
						// 设置是否自动生成包装尺寸标识
						if (res[0].sizeFollow != null) {
							sizeFollow = res[0].sizeFollow;
						}
					}
				});
		// 报价单编号
		var id = $('pId').value;
		if (id == 'null' || id == '') {
			shenBox.setValue(0);
			// 隐藏审核原因
			// Ext.getCmp('shenTab').disable();
			var addTime = getCurrentDate("yyyy-MM-dd HH:mm:ss");
			// 设置创建时间和创建人
			Ext.getCmp("addTime").setValue(addTime);
			addEmpBox.bindPageValue("CotEmps", "id", logId);

			// 初始化币种和价格条款和起运港的默认值
			cotOrderService.getList('CotPriceCfg', function(res) {
				if (res.length != 0) {
					shipPortBox.bindPageValue("CotShipPort", "id",
							res[0].shipPortId);
					clauseBox.bindValue(res[0].caluseId);
					if (res[0].currencyId != null) {
						curBox.bindValue(res[0].currencyId);
						$('oldCur').value = res[0].currencyId;
						// 变更汇率
						sysdicutil.getDicListByName('currency', function(cl) {
									for (var i = 0; i < cl.length; i++) {
										if (cl[i].id == res[0].currencyId) {
											$('orderRate').value = cl[i].curRate;
											break;
										}
									}
								});
					}
					if (res[0].orderTip != null) {
						$('orderTip').value = res[0].orderTip;
					} else {
						$('orderTip').value = 0;
					}
					if (res[0].noPrice != null) {
						$('noPrice').value = res[0].noPrice;
					} else {
						$('noPrice').value = 0;
					}
					if (res[0].havePrice != null) {
						$('havePrice').value = res[0].havePrice;
					} else {
						$('havePrice').value = 2;
					}
					if (res[0].priceFob != null) {
						$('orderFob').value = res[0].priceFob;
					}
					if (res[0].priceProfit != null) {
						$('orderProfit').value = res[0].priceProfit;
					}
					containerBox.bindValue(res[0].containerTypeId);
					if (res[0].insureAddRate != null) {
						$('insureAddRate').value = res[0].insureAddRate;
					}
					if (res[0].insureRate != null) {
						$('insureRate').value = res[0].insureRate;
					}
					trafficBox.bindValue(res[0].trafficTypeId);
					companyBox.bindPageValue("CotCompany", "id",
							res[0].companyId);
					if (res[0].insertType != null) {
						$('insertType').value = res[0].insertType;
					} else {
						$('insertType').value = 0;
					}
					// 业务配置中是否审核(0不审核,1审核)
					// if (res[0].isCheck == 0) {
					// shenBox.setValue(9);
					// } else {
					// shenBox.setValue(0);
					// }
				}
			});
			if ($('cusId').value != 'null' && $('cusId').value != '') {
				custBox.bindPageValue("CotCustomer", "id", $('cusId').value);

			}
			if ($('busiId').value != 'null' && $('busiId').value != '') {
				empBox.bindPageValue("CotEmps", "id", $('busiId').value);
			}
		} else {
			// 初始报价配置值
			cotOrderService.getList('CotPriceCfg', function(res) {
						if (res.length != 0) {
							if (res[0].orderTip != null) {
								$('orderTip').value = res[0].orderTip;
							} else {
								$('orderTip').value = 0;
							}
							if (res[0].noPrice != null) {
								$('noPrice').value = res[0].noPrice;
							} else {
								$('noPrice').value = 0;
							}
							if (res[0].havePrice != null) {
								$('havePrice').value = res[0].havePrice;
							} else {
								$('havePrice').value = 2;
							}
							if (res[0].insertType != null) {
								$('insertType').value = res[0].insertType;
							} else {
								$('insertType').value = 0;
							}
						}
					});
			// 加载报价单信息
			cotOrderService.getOrderById(parseInt(id), function(res) {
				canOut = res.canOut;

				Ext.getCmp("orderTime").setValue(res.orderTime);
				Ext.getCmp("sendTime").setValue(res.sendTime);
				Ext.getCmp("orderLcDate").setValue(res.orderLcDate);
				Ext.getCmp("orderLcDelay").setValue(res.orderLcDelay);

				// 设置创建时间和创建人
				Ext.getCmp("addTime").setValue(res.addTime);
				addEmpBox.bindPageValue("CotEmps", "id", res.addPerson);

				// 设置修改时间和修改人
				Ext.getCmp("modTime").setValue(res.modTime);
				modEmpBox.bindPageValue("CotEmps", "id", res.modPerson);

				// 审核人
				empChkBox.bindPageValue("CotEmps", "id", res.checkPerson);
				// 如果是请求审核状态时,登录人是admin或者是该单的审核人时才显示审核通过和不通过2个按钮
				if (res.orderStatus == 3 || res.orderStatus == 2) {
					if (loginEmpId == "admin" || logId == res.checkPerson) {
						Ext.getCmp("guoBtn").show();
						Ext.getCmp("showPdfBtn").show();
						// Ext.getCmp("buBtn").show();
					}
				}
				// 如果登录人不是审核人,则显示请求审核按钮
				if ((res.orderStatus == 0 || res.orderStatus == 2)
						&& (loginEmpId == "admin" || logId != res.checkPerson)) {
					Ext.getCmp("qingBtn").show();
				}

				chkReason = res.checkReason;
				paycontract = res.payContract == null ? "" : res.payContract;
				givenNum = res.givenNum;
				givenDate = res.givenDate;
				givenUnit = res.givenUnit;
				DWRUtil.setValues(res);
				// 绑定下拉框
				custBox.bindPageValue("CotCustomer", "id", res.custId);
				$('buyerId').value = res.custId;
				factoryBox.bindPageValue("CotFactory", "id", res.factoryId);
				//$('facId').value = res.factoryId;
				$('isCheckId').value = res.isCheckAgent;
				empBox.bindPageValue("CotEmps", "id", res.bussinessPerson);
				curBox.bindValue(res.currencyId);
				clauseBox.bindValue(res.clauseTypeId);
				shipPortBox.bindPageValue("CotShipPort", "id", res.shipportId);
				targetPortBox.bindPageValue("CotTargetPort", "id",
						res.targetportId);
				containerBox.bindValue(res.containerTypeId);
				trafficBox.bindValue(res.trafficId);
				companyBox.bindPageValue("CotCompany", "id", res.companyId);
				commisionBox.bindValue(res.commisionTypeId);
				insureContractBox.bindValue(res.insureContractId);
				payTypeBox.bindValue(res.payTypeId);
				bankBox.bindValue(res.bankId);
				shenBox.setValue(res.orderStatus);
				zheBox.setValue(res.zheType);
				contactBox.loadValueById('CotCustContact', 'customerId',
						res.custId, res.contactId);

				orderZMArea = res.orderZM;
				orderZHMArea = res.orderZHM;
				orderCMArea = res.orderCM;
				orderNMArea = res.orderNM;
				productArea = res.productM;

				// 存储主单的10个字段
				txtAreaAry.quality = res.quality;
				txtAreaAry.colours = res.colours;
				txtAreaAry.saleUnit = res.saleUnit;
				txtAreaAry.handleUnit = res.handleUnit;
				txtAreaAry.assortment = res.assortment;
				txtAreaAry.comments = res.comments;
				txtAreaAry.shippingMark = res.shippingMark;
				txtAreaAry.buyer = res.buyer;
				txtAreaAry.seller = res.seller;
				txtAreaAry.agent = res.agent;
				txtAreaAry.isCheckAgent = res.isCheckAgent;
				// 储存预收货款比例和金额
				$('prePriceHid').value = res.prePrice;
				$('priceScalHid').value = res.priceScal;

				// 加载订单货款金额
				if (res.totalMoney != null) {
					$('totalLab').innerText = res.totalMoney.toFixed(deNum);
				} else {
					$('totalLab').innerText = 0;
				}
				// 加载订单实际金额
				if (res.realMoney != null) {
					$('realLab').innerText = res.realMoney.toFixed(deNum);
				} else {
					$('realLab').innerText = 0;
				}
				// 加载订单总体积
				if (res.totalCBM != null) {
					$('totalCbmLab').innerText = res.totalCBM.toFixed(cbmNum);
				} else {
					$('totalCbmLab').innerText = 0;
				}
				// 加载订单总毛重
				if (res.totalGross != null) {
					$('totalGrossLab').innerText = res.totalGross.toFixed('3');
				} else {
					$('totalGrossLab').innerText = 0;
				}
				// 如果已经出货过,隐藏保存按钮
				if (res.canOut == 2) {
					Ext.getCmp('saveBtn').hide();
					tb.hide();
				}
			});
		}
		// 得到单样品利润公式
		cotOrderService.getLiRunCau(function(cau) {
					liRunCau = cau;
				});
		DWREngine.setAsync(true);
	}
	unmask();
	initform();

	// 添加选择的样品到可编辑表格
	this.insertSelect = function(list, flag) {
		if (!flag) {
			// 删除该货号所在行
			ds.remove(editRec);
		}
		var eleAry = new Array();
		Ext.each(list, function(item) {
					eleAry.push(item.data.eleId);
				});
		var noPrice = $('noPrice').value;
		var havePrice = $('havePrice').value;
		var currencyId = $('currencyId').value;
		var clauseId = $('clauseTypeId').value;
		var orderTime = $('orderTime').value;
		for (var i = 0; i < eleAry.length; i++) {
			// 判断该产品是否对该用户报价过
			DWREngine.setAsync(false);
			cotOrderService.findIsExistDetail(eleAry[i], $('custId').value,
					clauseId, orderTime, function(rtn) {
						// 取得随机数
						var rdm = getRandom();
						if (rtn != null) {
							var result = rtn[1];
							if (rtn[0] == 1) {
								result.type = 'price';
								result.orderPrice = result.pricePrice;
							} else if (rtn[0] == 2) {
								result.type = 'order';
							} else if (rtn[0] == 3) {
								result.orderPrice = result.priceOut;
								result.currencyId = result.priceOutUint;
								result.type = 'given';
							}
							result.srcId = result.id;
							result.id = null;
							result.rdm = rdm;
							// 取对外报价
							if (havePrice == 0) {
								// 判断该产品货号是否存在,有存在的话转成报价明细
								DWREngine.setAsync(false);
								cotOrderService.changeEleToOrderDetail(
										eleAry[i], function(res) {
											if (res != null) {
												res.type = 'ele';
												res.srcId = res.id;
												res.id = null;
												// 重新换算价格(币种不同时)
												DWREngine.setAsync(false);
												queryService.updatePrice(
														res.priceOut,
														res.priceOutUint,
														currencyId, function(
																newPri) {
															res.orderPrice = newPri
																	.toFixed(deNum);
															res.currencyId = currencyId;
															res.rdm = rdm;

															insertToGrid(res,
																	false);

														});
												DWREngine.setAsync(true);
											}
										});
								DWREngine.setAsync(true);

							}
							// 按价格条款计算
							if (havePrice == 1) {
								result.currencyId = currencyId;
								insertToGrid(result, false);
							}
							// 取最近一次报价
							if (havePrice == 2) {
								// 重新换算价格(币种不同时)
								DWREngine.setAsync(false);
								queryService.updatePrice(result.orderPrice,
										result.currencyId, currencyId,
										function(newPri) {
											result.orderPrice = newPri
													.toFixed(deNum);
											result.currencyId = currencyId;
											insertToGrid(result, false);
										});
								DWREngine.setAsync(true);
							}
						} else {
							// 判断该产品货号是否存在,有存在的话转成报价明细
							DWREngine.setAsync(false);
							cotOrderService.changeEleToOrderDetail(eleAry[i],
									function(res) {
										if (res != null) {
											res.type = 'ele';
											res.srcId = res.id;
											res.id = null;
											res.rdm = rdm;
											// 取对外报价
											if (noPrice == 0) {
												// 重新换算价格(币种不同时)
												queryService.updatePrice(
														res.priceOut,
														res.priceOutUint,
														currencyId, function(
																newPri) {
															res.orderPrice = newPri
																	.toFixed(deNum);
															res.currencyId = currencyId;
															insertToGrid(res,
																	false);
														});
											}
											// 按价格条款计算
											if (noPrice == 1) {
												res.currencyId = currencyId;
												insertToGrid(res, true);
											}
										}
									});
							DWREngine.setAsync(true);
						}
					});
			DWREngine.setAsync(true);
		}
		unmask();
	}

	// 获得表格选择行
	function getIds() {
		var list = sm.getSelections();
		var res = new Array();
		Ext.each(list, function(item) {
					res.push(item.id);
				});
		return res;
	}

	// 打开编辑页面
	function windowopenMod(obj) {
		if (obj == null) {
			var ids = getIds();
			if (ids.length == 0) {
				Ext.MessageBox.alert("Message", "Please select a record");
				return;
			} else if (ids.length > 1) {
				Ext.MessageBox
						.alert("Message", "You can only select a record!");
				return;
			} else
				obj = ids[0];

		}
		openWindowBase(555, 800, 'cotorder.do?method=addPrice&id=' + obj);
	}

	// 保存
	function save() {
		var popedom = checkAddMod($('pId').value);
		if (popedom == 1) {
			Ext.MessageBox
					.alert('Message', 'Sorry, you do not have Authority!');
			return;
		} else if (popedom == 2) {
			Ext.MessageBox
					.alert('Message', 'Sorry, you do not have Authority!');
			return;
		}
		// 审核通过不让修改
		// if ($('orderStatus').value == 2 && loginEmpId != "admin") {
		// Ext.MessageBox
		// .alert('Message',
		// 'Sorry, this order has been reviewed and can not be modified!');
		// return;
		// }

		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}

		// 验证单号是否存在
		var shortflag = false;
		var orderNo = $('orderNo').value;
		DWREngine.setAsync(false);
		cotOrderService.findIsExistOrderNo(orderNo, $('pId').value, function(
						res) {
					if (res != null) {
						shortflag = true;
					}
				});
		if (shortflag) {
			Ext.MessageBox.alert("Message",
					"The W&C P/I already exists, enter a new one!");
			return;
		}
		DWREngine.setAsync(true);
		Ext.MessageBox.confirm('Message', 'Do you want to save the order?',
				function(btn) {
					if (btn == 'yes') {
						var price = DWRUtil.getValues('orderForm');
						var cotOrder = {};
						var checkFlag = false;
						// 如果编号存在时先查询出对象,再填充表单
						if ($('pId').value != 'null' && $('pId').value != '') {
							DWREngine.setAsync(false);
							cotOrderService.getOrderById($('pId').value,
									function(res) {
										for (var p in price) {

											if (p != 'orderTime'
													&& p != 'sendTime'
													&& p != 'orderLcDelay'
													&& p != 'orderLcDate'
													&& p != 'addTime'
													&& p != 'modTime') {
												res[p] = price[p];
											}
										}
										cotOrder = res;
									});
							DWREngine.setAsync(true);
							// checkFlag = checkIsChangePice();
						} else {

							cotOrder = new CotOrder();
							for (var p in cotOrder) {
								if (p != 'orderTime' && p != 'sendTime'
										&& p != 'orderLcDelay'
										&& p != 'orderLcDate' && p != 'addTime'
										&& p != 'modTime') {
									cotOrder[p] = price[p];
								}
							}

						}
						// 唛标
						if (Ext.getCmp("orderZMArea").isVisible()) {
							cotOrder.orderZM = $('orderZMArea').value;
							cotOrder.orderCM = $('orderCMArea').value;
							cotOrder.orderZHM = $('orderZHMArea').value;
							cotOrder.orderNM = $('orderNMArea').value;
							cotOrder.productM = $('productArea').value;
						}
						// 其它信息
						if (Ext.isEmpty(Ext.getCmp('quality').getValue())) {
							cotOrder.quality = txtAreaAry.quality;
						} else {
							cotOrder.quality = Ext.getCmp('quality').getValue();
						}
						if (Ext.isEmpty(Ext.getCmp('colours').getValue())) {
							cotOrder.colours = txtAreaAry.colours;
						} else {
							cotOrder.colours = Ext.getCmp('colours').getValue();
						}

						if (Ext.isEmpty(Ext.getCmp('saleUnit').getValue())) {
							cotOrder.saleUnit = txtAreaAry.quality;
						} else {
							cotOrder.saleUnit = Ext.getCmp('saleUnit')
									.getValue();
						}
						if (Ext.isEmpty(Ext.getCmp('handleUnit').getValue())) {
							cotOrder.handleUnit = txtAreaAry.handleUnit;
						} else {
							cotOrder.handleUnit = Ext.getCmp('handleUnit')
									.getValue();
						}

						if (Ext.isEmpty(Ext.getCmp('assortment').getValue())) {
							cotOrder.assortment = txtAreaAry.assortment;
						} else {
							cotOrder.assortment = Ext.getCmp('assortment')
									.getValue();
						}
						if (Ext.isEmpty(Ext.getCmp('comments').getValue())) {
							cotOrder.comments = txtAreaAry.comments;
						} else {
							cotOrder.comments = Ext.getCmp('comments')
									.getValue();
						}

						if (Ext.isEmpty(Ext.getCmp('shippingMark').getValue())) {
							cotOrder.shippingMark = txtAreaAry.shippingMark;
						} else {
							cotOrder.shippingMark = Ext.getCmp('shippingMark')
									.getValue();
						}

						if (Ext.isEmpty(Ext.getCmp('buyer').getValue())) {
							cotOrder.buyer = txtAreaAry.buyer;
						} else {
							cotOrder.buyer = Ext.getCmp('buyer').getValue();
						}

						if (Ext.isEmpty(Ext.getCmp('seller').getValue())) {
							cotOrder.seller = txtAreaAry.seller;
						} else {
							cotOrder.seller = Ext.getCmp('seller').getValue();
						}
						if (Ext.isEmpty(Ext.getCmp('agent').getValue())) {
							cotOrder.agent = txtAreaAry.agent;
						} else {
							cotOrder.agent = Ext.getCmp('agent').getValue();
						}
						var txt = txtAreaAry.isCheckAgent;
						if (Ext.isEmpty(txt)) {
							cotOrder.isCheckAgent = '0';
						} else {
							cotOrder.isCheckAgent = txtAreaAry.isCheckAgent;
						}

						var oldFlag = false;
						if ($('uploadSuc').value == "0") {
							oldFlag = true;
						}
						//TODO:
						//alert(cotOrder.agent);
						//return;
						// //alert(Ext.getCmp('shippingMark').getValue());
						// txtAreaAry.shippingMark
						// =Ext.getCmp('shippingMark').getValue();
						// cotOrder.shippingMark=Ext.getCmp('shippingMark').getValue();
						cotOrder.custId = custBox.getValue();
						DWREngine.setAsync(false);
						cotOrderService.saveOrUpdateOrder(cotOrder,
								$('orderTime').value, $('sendTime').value,
								$('orderLcDate').value,
								$('orderLcDelay').value, $('addTime').value,
								oldFlag, function(res) {
									if (res != null) {
										// 当新建时,如果默认配置需要审核,保存后显示"提请审核","另存为"按钮
										if ($('pId').value == ''
												|| $('pId').value == 'null') {
											if ($('orderStatus').value == 0) {
												Ext.getCmp("qingBtn").show();
											}
											Ext.getCmp('saveAsBtn').show();

											// if (Ext.getCmp('orderZMArea')
											// .isVisible()) {
											// Ext.getCmp('upmodMai').show();
											// Ext.getCmp('updelMai').show();
											// Ext.getCmp('upmodProMai')
											// .show();
											// Ext.getCmp('updelProMai')
											// .show();
											// }
										} else {
											// 加载修改时间和修改人
											Ext.getCmp("modTime")
													.setValue(new Date());
											modEmpBox.bindPageValue("CotEmps",
													"id", logId);
										}
										$('pId').value = res;
										// 更改添加action参数
										var urlAdd = '&orderPrimId=' + res
												+ '&currencyId='
												+ $('currencyId').value
												+ '&custId='
												+ $('custId').value;
										// 更改修改action参数
										var urlMod = '&custId='
												+ $('custId').value
												+ '&currencyId='
												+ $('currencyId').value;
										ds.proxy.setApi({
											read : "cotorder.do?method=queryOrderDetail&orderId="
													+ res,
											create : "cotorder.do?method=add"
													+ urlAdd,
											update : "cotorder.do?method=modify"
													+ urlMod,
											destroy : "cotorder.do?method=remove"
										});

										// 如果订单明细没有修改
										if (ds.getModifiedRecords().length == 0
												&& ds.removed.length == 0) {
											// 保存其他费用
											// 修改主单的总数量,总箱数,总体积,总金额
											cotOrderService
													.modifyCotOrderTotalAction(
															res, function(tol) {
																if (tol != null) {
																	$('totalLab').innerText = tol[0]
																			.toFixed(deNum);
																	$('realLab').innerText = tol[2]
																			.toFixed(deNum);
																	$('totalCbmLab').innerText = tol[1]
																			.toFixed(cbmNum);
																	$('totalGrossLab').innerText = tol[3]
																			.toFixed("3");
																}
															});
										} else {
											ds.save();
										}

										$('uploadSuc').value = "";
										reflashParent('orderGrid');
										reloadHome();
										
										Ext.Msg.alert("Message",
												"Successfully saved！");
									} else {
										Ext.MessageBox.alert('Message',
												'Save failed');
										unmask();
									}
								});
						DWREngine.setAsync(true);
					}
				});
	}

	// 删除
	function del() {
		// 如果该单没保存直接删除
		if ($('pId').value == 'null' || $('pId').value == '') {
			closeandreflashEC(true, 'orderGrid', false);
			return;
		}

//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox.alert('Message',
//					'Sorry, this record has been reviewed can not be deleted!');
//			return;
//		}
		var isPopedom = getPopedomByOpType("cotorder.do", "DEL");
		if (isPopedom == 0) {// 没有删除权限
			Ext.MessageBox.alert('Message',
					"'Sorry, you do not have Authority!");
			return;
		}
		var list = new Array();
		list.push($('pId').value);
		Ext.MessageBox.confirm('Message',
				'Are you sure you want to delete the order?', function(btn) {
					if (btn == 'yes') {
						DWREngine.setAsync(false);
						cotOrderService.deleteOrders(list, function(res) {
							if (res == 0) {
								Ext.MessageBox.alert('Message',
										"Deleted successfully");
								closeandreflashEC('true', 'orderGrid', false);
							} else if (res == 1) {
								Ext.MessageBox
										.alert('Message',
												"The order has broken down to P.O, can not be deleted!");
							} else if (res == 2) {
								Ext.MessageBox.alert('Message',
										"该订单已生成应收帐款,不能删除!");
							} else if (res == 3) {
								Ext.MessageBox
										.alert('Message',
												"The order has been shipped arrangements can not be deleted!");
							} else if (res == 5) {
								Ext.MessageBox.alert('Message',
										"该订单已生成配件采购单,不能删除!");
							} else if (res == 6) {
								Ext.MessageBox.alert('Message',
										"该订单已生成包材采购单,不能删除!");
							} else if (res == 4) {
								Ext.MessageBox
										.alert('Message', "Delete failed");
							}
						})
						DWREngine.setAsync(true);
					}
				});
	}

	// 显示导入界面
	function showImportPanel(type) {
//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox.alert('Message',
//					'Sorry, records have been reviewed can not be modified!');
//			return;
//		}
		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}
		var cfg = {};
		cfg.custId = $('custId').value;
		cfg.currencyId = curBox.getValue();
		cfg.bar = _self;
		cfg.type = 'order';
		cfg.no = $('orderNo').value;

		// 如果只勾选了一个货号,查询该货号的子货号
		var rec = sm.getSelections();
		if (rec.length == 1) {
			cfg.parentEleId = rec[0].data.eleId;
		}

		// 新建的单据不能图片导入
		var id = $('pId').value;
		if (type == 5 && (id == '' || id == 'null')) {
			Ext.MessageBox.alert('Message',
					'Not save the record, can not import picture!');
			return;
		}

		// 图片导入需要pId
		if (id != '' && id != 'null') {
			cfg.pId = id;
		} else {
			cfg.pId = 0;
		}

		var importPanel = new ImportPanel(cfg);
		importPanel.show();
		importPanel.openPnl(type);
		// if(!type)
	}

	// 显示配件及成本界面
	function showFitPricePanel() {
		// 验证表单
		// var formData = getFormValues(orderForm, true);
		// // 表单验证失败时,返回
		// if (!formData) {
		// return;
		// }
		var ids = getIds();
		if (ids.length == 0) {
			Ext.MessageBox.alert("message", "Pls. select a record");
			return;
		} else if (ids.length > 1) {
			Ext.MessageBox.alert("message", "You can only select a record!")
			return;
		}
		// 如果该货号是来源送样单,则

		var cfg = {};
		cfg.custId = ids[0];
		cfg.isHId = sm.getSelected().get("id");
		cfg.eleId = sm.getSelected().get("eleId");
		cfg.eleName = sm.getSelected().get("eleName");
		cfg.pId = $('pId').value;
		cfg.bar = _self;
		cfg.rdm = sm.getSelected().get("rdm");
		cfg.orderStatus = $('orderStatus').value
		cfg.reflashFn = updatePriceFacWhenElePriceChange;
		// 获得生产价币种
		cfg.facCur = sm.getSelected().get("priceFacUint");
		var fitPricePanel = new FitPricePanel(cfg);
		fitPricePanel.show();
		fitPricePanel.openPnl(0);
	}

	// 反算利润率
	function calLiRun() {
//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox
//					.alert('Message',
//							'Sorry, this record has been reviewed can not be modified!');
//			return;
//		}
		if (liRunCau == "") {
			Ext.MessageBox.alert("Message", "You have not set the formula!");
			return;
		}
		var list = sm.getSelections();
		var res = new Array();
		// 将计算单价的参数组成一个map
		var mapPrice = {};
		mapPrice.currencyId = $('currencyId').value;// 币种
		mapPrice.orderProfit = $('orderProfit').value;// 利润率
		mapPrice.orderFob = $('orderFob').value;// FOB
		mapPrice.orderRate = $('orderRate').value;// 汇率
		mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
		mapPrice.insureRate = $('insureRate').value;// 保险费率
		mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
		mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
		Ext.each(list, function(item) {
					res.push(item.data.rdm);
				});
		if (res.length == 0) {
			Ext.MessageBox.alert("Message",
					"Pls. select the Order Details records!");
			return;
		}
		// 后台统一计算出所有价格.再来页面更改
		cotOrderService.calLiRun(mapPrice, res, function(map) {
					Ext.each(list, function(item) {
								var lirun = map[item.data.rdm];
								if (lirun != null) {
									item.set('liRun', lirun);
								} else {
									item.set('liRun', 0);
								}
							});
					Ext.MessageBox.alert("message", "Calculation done!");
				});
	}

	function showHisPricePanel() {
		var ids = getIds();
		if (ids.length == 0) {
			Ext.MessageBox.alert("Message", "Pls. select a record");
			return;
		} else if (ids.length > 1) {
			Ext.MessageBox.alert("Message", "You can only select a record!")
			return;
		}
		var hispriceGrid = new HisPriceGrid({
					custId : Ext.getDom("custId").value,
					eleId : sm.getSelected().get("eleId"),
					dblFn : replacePrice
				});
		var win = new Ext.Window({
					id : "hisWin",
					title : "Price History",
					width : 800,
					height : 500,
					modal : true,
					layout : 'fit',
					items : [hispriceGrid]
				})
		win.show();
		hispriceGrid.load();
	}

	function showModPriceWin() {
		var ids = getIds();
		if (ids.length == 0) {
			Ext.MessageBox.alert("Message", "Pls. select a record");
			return;
		} else if (ids.length > 1) {
			Ext.MessageBox.alert("Message", "You can only select a record!")
			return;
		}
		var rec = sm.getSelections();

		var cfg = {};
		cfg.eleId = rec[0].data.eleId;
		cfg.custId = $('custId').value;
		// 获得主单币种
		cfg.facCur = $('currencyId').value;
		var win = new ModPriceWin(cfg);
		win.show();
	}

	// 查看该货号导入的出货单据
	function showOrderOut() {
		var recs = sm.getSelections();
		if (recs.length == 0) {
			Ext.MessageBox.alert('Message', "Please select a record!");
			return;
		}
		if (recs.length > 1) {
			Ext.MessageBox.alert('Message', "You can only view a record!");
			return;
		}
		var detailId = recs[0].id;
		var eleId = recs[0].data.eleId;
		var win = new OrderToOrderOutWin({
					'oId' : detailId,
					'eleId' : eleId
				});
		win.show();
	}

	// 获得没勾选单价复选框的行的产品货号字符串
	function getNoCheckIds() {
		var rdmIds = '';
		ds.each(function(rec) {
					var ck = rec.data.checkFlag;
					if (ck == null || ck == 0 || ck == false) {
						if (rec.data.rdm != null && rec.data.rdm != "") {
							rdmIds += rec.data.rdm + ",";
						}
					}
				});
		return rdmIds;
	}

	// 失去焦点事件
	function priceBlur() {
		// 得到没勾选的表格行并且货号不是空字符串的记录
		var rdmIds = getNoCheckIds();
		if (rdmIds == '') {
			return;
		}
		// 判断是否选择价格条款
		if ($('clauseTypeId').value == '') {
			return;
		}
		// 将计算单价的参数组成一个map
		var mapPrice = {};
		mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
		mapPrice.currencyId = $('currencyId').value;// 币种
		mapPrice.orderProfit = $('orderProfit').value;// 利润率
		mapPrice.orderFob = $('orderFob').value;// FOB
		mapPrice.orderRate = $('orderRate').value;// 汇率
		mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
		mapPrice.insureRate = $('insureRate').value;// 保险费率
		mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
		mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
		// 传递主单编号,有值时从报价明细中取,否则从样品表取
		var id = $('pId').value;
		if (id == 'null' || id == '') {
			id = 0;
		}
		cotOrderService.getNewOrder(rdmIds, mapPrice, liRunCau, function(res) {
					if (res != null) {
						ds.each(function(rec) {
									var ck = rec.data.checkFlag;
									if (ck == null || ck == 0 || ck == false) {
										var rdm = rec.data.rdm;
										if (rdm != null && rdm != "") {
											rec.set("orderPrice", res[rdm][0]
															.toFixed(deNum));
											rec.set("liRun", res[rdm][1]);
											updateMapValue(rdm, "orderPrice",
													res[rdm][0].toFixed(deNum));
											updateMapValue(rdm, "liRun",
													res[rdm][1]);
										}
									}
								});
					}
				});
	}

	// 失去焦点事件
	function priceBlurByCurreny(val) {
		// 变更汇率
		sysdicutil.getDicListByName('currency', function(res) {
			var newPriceRate = 0;
			for (var i = 0; i < res.length; i++) {
				if (res[i].id == val) {
					newPriceRate = res[i].curRate;
					break;
				}
			}
			var oldRate = $('orderRate').value;
			$('orderRate').value = newPriceRate;
			ds.each(function(rec) {
				var rdm = rec.data.rdm;
				if (rdm != null && rdm != "") {
					// 修改明细的币种
					updateMapValue(rdm, "currencyId", val);
					var temp = rec.data.rdm;
					rec.set("rdm", temp + "aaa");
					rec.set("rdm", temp);

					if (newPriceRate != 0 && oldRate != 0) {
						var ck = rec.data.checkFlag;
						if (ck == null || ck == 0 || ck == false) {
							var oldPrice = rec.data.orderPrice;
							var newPrice = oldPrice * oldRate / newPriceRate;
							rec.set("orderPrice", newPrice.toFixed(deNum));
							updateMapValue(rdm, "orderPrice", newPrice
											.toFixed(deNum));
							if (rdm != null && rdm != "") {
								// 将计算单价的参数组成一个map
								var mapPrice = {};
								mapPrice.currencyId = $('currencyId').value;// 币种
								mapPrice.orderProfit = $('orderProfit').value;// 利润率
								mapPrice.orderFob = $('orderFob').value;// FOB
								mapPrice.orderRate = newPriceRate;// 汇率
								mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
								mapPrice.insureRate = $('insureRate').value;// 保险费率
								mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
								mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
								mapPrice.price = newPrice;
								DWREngine.setAsync(false);
								cotOrderService.getNewLiRun(mapPrice, rdm,
										function(res) {
											if (res != null) {
												rec.set("liRun", res);
												updateMapValue(rdm, "liRun",
														res);
											}
										});
								DWREngine.setAsync(true);
							}
						}
					}
				}
			});
		});
	}

	// 条款组合改变事件
	function composeChange() {
		// 价格条款
		var clauseIdText = '';
		if ($('clauseTypeId').value != '') {
			clauseIdText = clauseBox.getRawValue();
		}
		// 起运港
		var shipportIdText = '';
		if ($('shipportId').value != '') {
			shipportIdText = " " + shipPortBox.getRawValue();
		}
		// 目的港
		var targetportIdText = '';
		if ($('targetportId').value != '') {
			targetportIdText = " " + targetPortBox.getRawValue();
		}
		// 佣金比例
		var commisionScaleText = '';
		if ($('commisionScale').value != '') {
			commisionScaleText = " c" + $('commisionScale').value;
		}
		// 币种
		var currencyIdText = '';
		if ($('currencyId').value != '') {
			currencyIdText = " in " + curBox.getRawValue();
		}
		// 佣金类型
		var commisionType = commisionBox.getRawValue();
		if (commisionType == '明佣') {
			if (clauseIdText == "FOB") {
				$('orderCompose').value = (clauseIdText + shipportIdText
						+ commisionScaleText + currencyIdText).toUpperCase();
			} else {
				$('orderCompose').value = (clauseIdText + targetportIdText
						+ commisionScaleText + currencyIdText).toUpperCase();
			}
		} else {
			if (clauseIdText == "FOB") {
				$('orderCompose').value = (clauseIdText + shipportIdText + currencyIdText)
						.toUpperCase();
			} else {
				$('orderCompose').value = (clauseIdText + targetportIdText + currencyIdText)
						.toUpperCase();
			}
		}
	}

	// 佣金比例改变事件
	function commisionScaleChange(txt, newVal, oldVal) {
		composeChange();
		var newNum = 0;
		if (newVal != '' && !isNaN(newVal)) {
			newNum = newVal;
		}
		// 将计算单价的参数组成一个map
		var mapPrice = {};
		mapPrice.currencyId = $('currencyId').value;// 币种
		mapPrice.orderProfit = $('orderProfit').value;// 利润率
		mapPrice.orderFob = $('orderFob').value;// FOB
		mapPrice.orderRate = $('orderRate').value;// 汇率
		mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
		mapPrice.insureRate = $('insureRate').value;// 保险费率
		mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
		mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型

		// 修改表格中的单价
		ds.each(function(rec) {
					var ck = rec.data.checkFlag;
					if (ck == null || ck == 0 || ck == false) {
						var rdm = rec.data.rdm;
						if (rdm != null && rdm != "") {
							var orderPrice = rec.data.orderPrice;
							var price = 0;
							if (orderPrice != '') {
								price = orderPrice;
							}
							// 先算出扣除佣金后的原始价
							if (price != 0 && oldVal != 0 && oldVal != '') {
								price = price / (1 + oldVal * 0.01);
							}
							price = (price * (1 + newNum * 0.01))
									.toFixed(deNum);
							rec.set('orderPrice', price);
							mapPrice.price = price;
							updateMapValue(rdm, "orderPrice", price);
							cotOrderService.getNewLiRun(mapPrice, rdm,
									function(res) {
										if (res != null) {
											rec.set("liRun", res);
											updateMapValue(rdm, "liRun", res);
										}
									});
						}
					}
				});
	}

	var customerZm = "";
	var customerCm = "";
	var customerZhm = "";
	var customerNm = "";

	// 根据选择的客户编号自动填写表单
	function setCustomerForm(cusId) {
		DWREngine.setAsync(false);
		cotOrderService.getCustomerById(parseInt(cusId), function(res) {
					var ship = $('shipportId').value;
					var ct = $("clauseTypeId").value;

					// DWRUtil.setValues(res);
					// 如果客户没价格条款,不加载
					if (res.clauseId == null) {
						$("clauseTypeId").value = ct;
					}
					$('custId').value = res.id;
					$('shipportId').value = ship;// 不更改起运港
					targetPortBox.bindPageValue("CotTargetPort", "id",
							res.trgportId);
					empBox.bindPageValue("CotEmps", "id", res.empId);
					commisionBox.bindValue(res.commisionTypeId);
					payTypeBox.bindValue(res.payTypeId);
					clauseBox.bindValue(res.clauseId);

					// 如果唛标可见,设置唛标图片和唛标信息
					// if (Ext.getCmp("orderZMArea").isVisible()) {
					// $('order_MB').src =
					// "./showPicture.action?flag=custMb&detailId="
					// + cusId;
					// Ext.getCmp("orderZMArea").setValue(res.customerZm);
					// Ext.getCmp("orderCMArea").setValue(res.customerCm);
					// Ext.getCmp("orderZHMArea").setValue(res.customerZhm);
					// Ext.getCmp("orderNMArea").setValue(res.customerNm);
					// }
					// customerZm = res.customerZm;
					// customerCm = res.customerCm;
					// customerZhm = res.customerZhm;
					// customerNm = res.customerNm;

					// 唛标在选择客户后更改
					$('uploadSuc').value = "0";
				});
		DWREngine.setAsync(true);

		// 延时
		var task = new Ext.util.DelayedTask(function() {
					composeChange();
				});
		task.delay(500);
	}

	// 获取单号
	function getOrderNo() {
		var currDate = $('orderTime').value;
		var custId = $('custId').value;
		var empId = empBox.getValue();
		if (currDate == "" || custId == null) {
			Ext.MessageBox.alert("Message", "Pls select a date");
			return;
		}
		if ($('custId').value == null || $('custId').value == "") {
			Ext.MessageBox.alert("Message", "Pls. select a client");
			return;
		}
		if (empBox.getValue() == null || empBox.getValue() == "") {
			Ext.MessageBox.alert("Message", "Please select a sales");
			return;
		}

		var id = $('pId').value;
		if (id == 'null' || id == '') {
			cotSeqService.getOrderNo(custId, empId, currDate, function(ps) {
						$('orderNo').value = ps;
					});
		}
	}

	// 另存为--获取单号
	function getNewOrderNo() {
		var currDate = $('orderTime').value;
		var custId = $('custId').value;
		var empId = empBox.getValue();
		if (currDate == "" || custId == null) {
			Ext.MessageBox.alert("Message", "Pls select a date");
			return;
		}
		if ($('custId').value == null || $('custId').value == "") {
			Ext.MessageBox.alert("Message", "Pls. select a client");
			return;
		}
		if (empBox.getValue() == null || empBox.getValue() == "") {
			Ext.MessageBox.alert("Message", "Please select a sales");
			return;
		}
		cotSeqService.getOrderNo(custId, empId, currDate, function(ps) {
					$('modelEle').value = ps;
				});
	}

	// 计算包材价格
	function calPrice() {
		var rdm = $('rdm').value;
		if (rdm == '' || rdm == 'rdm') {
			return;
		}
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		DWREngine.setAsync(false);
		cotOrderService.calPriceAll(rdm, function(res) {
					if (res != null) {
						$('boxPbPrice').value = res[0];
						$('boxIbPrice').value = res[1];
						$('boxMbPrice').value = res[2];
						$('boxObPrice').value = res[3];
						$('packingPrice').value = res[4];
						$('inputGridPrice').value = res[6];
						DWREngine.setAsync(false);
						cotOrderService.getOrderMapValue(rdm, function(obj) {
									if (obj != null) {
										obj.boxPbPrice = res[0];
										obj.boxIbPrice = res[1];
										obj.boxMbPrice = res[2];
										obj.boxObPrice = res[3];
										obj.packingPrice = res[4];
										if (res[5] != -1) {
											obj.priceFac = res[5];
										}
										obj.inputGridPrice = res[6];

										// 将对象储存到后台map中
										cotOrderService.setOrderMap(rdm, obj,
												function(def) {
												});
									}
								});
						DWREngine.setAsync(true);
						// 修改表格生产价和根据公式计算
						if (res[5] != -1 && index != -1) {
							var rec = ds.getAt(index);
							rec.set("priceFac", res[5].toFixed(facNum));
						}
					} else {
						Ext.MessageBox.alert('Message',
								'Please select a record!');
					}
				});
		DWREngine.setAsync(true);
	}

	// 加载包装类型值
	function selectBind(com, rec, index) {
		var id = rec.data.id;
		var rdm = $('rdm').value;
		if (rdm == '' || rdm == 'rdm') {
			return;
		}
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(obj) {
					if (obj != null) {
						cotElementsService.getBoxTypeById(id, function(res) {
									if (res != null) {
										if (res.boxIName == null) {
											boxIbTypeBox.setValue("");
										} else {
											boxIbTypeBox
													.bindValue(res.boxIName);
										}
										if (res.boxMName == null) {
											boxMbTypeBox.setValue("");
										} else {
											boxMbTypeBox
													.bindValue(res.boxMName);
										}
										if (res.boxOName == null) {
											boxObTypeBox.setValue("");
										} else {
											boxObTypeBox
													.bindValue(res.boxOName);
										}
										if (res.boxPName == null) {
											boxPbTypeBox.setValue("");
										} else {
											boxPbTypeBox
													.bindValue(res.boxPName);
										}
										if (res.inputGridType == null) {
											inputGridTypeIdBox.setValue("");
										} else {
											inputGridTypeIdBox
													.bindValue(res.inputGridType);
										}
										obj.boxTypeId = id;
										obj.boxIbTypeId = res.boxIName;
										obj.boxMbTypeId = res.boxMName;
										obj.boxObTypeId = res.boxOName;
										obj.boxPbTypeId = res.boxPName;
										obj.inputGridTypeId = res.inputGridType;
										// 将对象储存到后台map中
										DWREngine.setAsync(false);
										cotOrderService.setOrderMap(rdm, obj,
												function(def) {
													calPrice();
												});
										DWREngine.setAsync(true);
									}
								});

					}
				});
		DWREngine.setAsync(true);
	};

	// 根据产品货号查找样品数据
	function insertToGrid(existDetail, type, ak) {
		// 订单默认数量为0
		existDetail.boxCount = 0;
		existDetail.containerCount = 0;
		existDetail.totalMoney = 0;
		existDetail.orderId = null;

		// 设置序列号
		// existDetail.sortNo = getNewSortNo("priceDetail", ak);
		// 是否采用上次报价
		if (type == false) {
			// 将添加的样品对象储存到后台map中
			DWREngine.setAsync(false);
			cotOrderService.setOrderMap(existDetail.rdm, existDetail, function(
							res) {
						setObjToGrid(existDetail);
					});
			DWREngine.setAsync(true);
		} else {
			// 将计算单价的参数组成一个map
			var mapPrice = {};
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
			mapPrice.orderProfit = $('orderProfit').value;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
			// 根据样品货号查找样品
			DWREngine.setAsync(false);
			cotOrderService.findDetailByEleId(existDetail, mapPrice, liRunCau,
					function(result) {
						if (result != null) {
							// 将添加的样品对象储存到后台map中
							cotOrderService.setOrderMap(existDetail.rdm,
									result, function(res) {
										setObjToGrid(result);
									});
						} else {
							Ext.MessageBox.alert('Message',
									'根据报价配置,您需要先选择价格条款并配置对应的报价公式!');
						}
					});
			DWREngine.setAsync(true);
		}
	}

	// 根据报价配置决定单价的取值
	function insertByCfg(eleId) {
		var noPrice = $('noPrice').value;
		var havePrice = $('havePrice').value;
		var currencyId = $('currencyId').value;
		var clauseId = $('clauseTypeId').value;
		var orderTime = $('orderTime').value;
		// 判断该产品是否对该用户报价过
		cotOrderService.findIsExistDetail(eleId, $('custId').value, clauseId,
				orderTime, function(rtn) {
					// 取得随机数
					var rdm = getRandom();
					if (rtn != null) {
						var result = rtn[1];
						if (rtn[0] == 1) {
							result.orderPrice = result.pricePrice;
							result.type = 'price';
						} else if (rtn[0] == 2) {
							result.type = 'order';
						} else if (rtn[0] == 3) {
							result.orderPrice = result.priceOut;
							result.currencyId = result.priceOutUint;
							result.type = 'given';
						}
						result.srcId = result.id;
						result.id = null;
						result.rdm = rdm;
						// 取对外报价
						if (havePrice == 0) {
							// 判断该产品货号是否存在,有存在的话转成报价明细
							cotOrderService.changeEleToOrderDetail(eleId,
									function(res) {
										if (res != null) {
											res.type = 'ele';
											res.srcId = res.id;
											res.id = null;
											// 重新换算价格(币种不同时)
											queryService.updatePrice(
													res.priceOut,
													res.priceOutUint,
													currencyId,
													function(newPri) {
														res.orderPrice = newPri
																.toFixed(deNum);
														res.currencyId = currencyId;
														res.rdm = rdm;
														// ds.remove(editRec);//
														// 删除行
														insertToGrid(res, false);
														addNewGrid();
													});
										} else {
											// 新货号处理(根据报价配置:逐条询问还是不询问)
											if ($('insertType').value == 0) {
												showEleTable(eleId);
											} else {
												// 直接当新货号加到表格
												_self.noEleAsNew(eleId);
											}
										}
									});

						}
						// 按价格条款计算
						if (havePrice == 1) {
							// ds.remove(editRec);// 删除行
							result.currencyId = currencyId;
							insertToGrid(result, true);
							addNewGrid();
						}
						// 取最近一次报价
						if (havePrice == 2) {
							// 重新换算价格(币种不同时)
							queryService.updatePrice(result.orderPrice,
									result.currencyId, currencyId, function(
											newPri) {
										result.orderPrice = newPri
												.toFixed(deNum);
										result.currencyId = currencyId;
										// ds.remove(editRec);// 删除行
										insertToGrid(result, false);
										addNewGrid();
									});
						}
					} else {
						// 判断该产品货号是否存在,有存在的话转成报价明细
						cotOrderService.changeEleToOrderDetail(eleId, function(
										res) {
									if (res != null) {
										res.type = 'ele';
										res.srcId = res.id;
										res.id = null;
										res.rdm = rdm;
										// 取对外报价
										if (noPrice == 0) {
											// 重新换算价格(币种不同时)
											queryService.updatePrice(
													res.priceOut,
													res.priceOutUint,
													currencyId,
													function(newPri) {
														res.orderPrice = newPri
																.toFixed(deNum);
														res.currencyId = currencyId;
														// ds.remove(editRec);//
														// 删除行
														insertToGrid(res, false);
														addNewGrid();
													});
										}
										// 按价格条款计算
										if (noPrice == 1) {
											// ds.remove(editRec);
											res.currencyId = currencyId;
											insertToGrid(res, true);
											addNewGrid();
										}
									} else {
										// 新货号处理(根据报价配置:逐条询问还是不询问)
										if ($('insertType').value == 0) {
											showEleTable(eleId);
										} else {
											// 直接当新货号加到表格
											_self.noEleAsNew(eleId);
										}
									}
								});
					}
				});
	}

	// 显示样品查询面板
	var _self = this;
	function showEleTable(eleId) {
		var eleQueryWin = new EleQueryWin({
					bar : _self,
					title : 'Find "' + eleId + '" from Product Info',
					eleIdFind : eleId
				});
		eleQueryWin.show();
	};

	// 添加带有数据的record到表格中
	function setObjToGrid(obj) {
		// 获得该行的新序号(该列的最大值+1)
		var sortNo = 0;
		ds.each(function(rec) {
					if (rec.data.sortNo > sortNo)
						sortNo = rec.data.sortNo;
				});
		obj.sortNo = sortNo + 1;
		obj.checkFlag = 1;// 默认价格锁定
		var u = new ds.recordType(obj);
		ds.add(u);

	}

	// 添加空白record到表格中
	var facPriceUnit = 0;// 默认币种ID
	function addNewGrid() {
//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox
//					.alert('Message',
//							'Sorry, this record has been reviewed can not be modified!');
//			return;
//		}
		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}
		if (facPriceUnit == 0) {
			DWREngine.setAsync(false);
			cotOrderService.getList('CotPriceCfg', function(res) {
						if (res.length != 0 && res[0].facPriceUnit != null) {
							facPriceUnit = res[0].facPriceUnit;
						}
					});
			DWREngine.setAsync(true);
		}

		// 获得该行的新序号(该列的最大值+1)
		var sortNo = 0;
		ds.each(function(rec) {
					if (rec.data.sortNo > sortNo)
						sortNo = rec.data.sortNo;
				});

		var u = new ds.recordType({
					eleId : "",
					sortNo : sortNo + 1,
					custNo : "",
					eleName : "",
					eleNameEn : "",
					eleCol : "",
					orderPrice : "",
					checkFlag : "",
					taoUnit : "",
					eleUnit : "",
					liRun : "",
					tuiLv : "",
					boxCount : "",
					containerCount : "",
					totalMoney : "",
					boxCbm : "",
					totalCbm : "",
					factoryId : "",
					factoryNo : "",
					priceFac : "",
					priceFacUint : (facPriceUnit == 0 ? "" : facPriceUnit),
					eleTypeidLv1 : "",
					eleSizeDesc : "",
					eleInchDesc : "",
					boxIbCount : "",
					boxMbCount : "",
					boxObCount : "",
					boxObL : "",
					boxObW : "",
					boxObH : "",
					boxGrossWeigth : "",
					boxNetWeigth : "",
					type : "",
					srcId : "",
					rdm : ""
				});
		ds.add(u);
		// 货号获得焦点
		var cell = grid.getView().getCell(ds.getCount() - 1, 3);
		if (Ext.isIE) {
			cell.fireEvent("ondblclick");
		} else {
			var e = document.createEvent("Events");
			e.initEvent("dblclick", true, false);
			cell.dispatchEvent(e);
		}
	}

	// 统计
	function sumTotal() {
		// 获取其他费用金额
		var temp = Number($('realLab').innerText).sub($('totalLab').innerText);
		// 货款总金额
		var totalMoney = Number(summary.getSumTypeValue('totalMoney'));
		// 判断折扣类型
		if (zheBox.getValue() == 2) {
			// 折扣率
			if ($('zheNum').value != '') {
				var zheNum = Number($('zheNum').value).mul(0.01);
				$('totalLab').innerText = (totalMoney.mul(zheNum))
						.toFixed(deNum);
			} else {
				$('totalLab').innerText = totalMoney.toFixed(deNum);
			}
		} else {
			$('totalLab').innerText = totalMoney.toFixed(deNum);
		}

		// 实际金额
		var realMoney = summary.getSumTypeValue('totalMoney');
		$('realLab').innerText = (Number($('totalLab').innerText).add(temp))
				.toFixed(deNum);
		// 总体积
		var totalCbm = summary.getSumTypeValue('totalCbm');
		$('totalCbmLab').innerText = Number(totalCbm).toFixed(cbmNum);
		// 总毛重
		var totalGrossWeigth = summary.getSumTypeValue('totalGrossWeigth');
		$('totalGrossLab').innerText = Number(totalGrossWeigth).toFixed('3');
	}

	// 删除
	function onDel() {
		mask();
		// 延时
		var task = new Ext.util.DelayedTask(function() {
					DWREngine.setAsync(false);
					var cord = sm.getSelections();
					var flag = false;
					// 需要判断该明细是否已生成出货和采购(产品,配件,包材)
					Ext.each(cord, function(item) {
						// if (!isNaN(item.id)) {
						// cotOrderService.findIsCanDel(item.id,
						// function(res) {
						// if (res == 0) {
						// flag = true;
						// } else {
						// ds.remove(item);
						// }
						// });
						// } else {
						ds.remove(item);
							// }
						});
					if (rightForm.isVisible()) {
						$('picPath').src = "./showPicture.action?flag=noPic";
						clearFormAndSet(rightForm);
					}
					sumTotal();
					unmask();
					// if (flag) {
					// Ext.MessageBox
					// .alert(
					// 'Message',
					// 'Generated purchase orders, shipping orders generated, or
					// order details can not be deleted!');
					// }
					DWREngine.setAsync(true);
				});
		task.delay(500);
	}

	// 初始化页面,加载报表详细信息
	function initForm(record) {
		var eleId = record.data.eleId;
		var rdm = record.data.rdm;
		var type = record.data.type;
		var srcId = record.data.srcId;
		var flag = true;
		if (isNaN(record.id)) {
			flag = false;
		}
		// flag区分是点击已存在行调用(true)还是新添加(false)
		if (flag && canOut != 2) {
			Ext.getCmp("upmod").show();
			Ext.getCmp("updel").show();
		} else {
			Ext.getCmp("upmod").hide();
			Ext.getCmp("updel").hide();
		}
		var isSelPic = getPdmByOtherUrl("cotpicture.do", "SEL");
		var popdom = false;
		if (isSelPic == 0) {// 没有查看图片信息权限
			Ext.getCmp("upmod").hide();
			Ext.getCmp("updel").hide();
			popdom = true;
		}
		var isMod = getPopedomByOpType("cotorder.do", "MOD");
		if (isMod == 0) {// 没有修改权限
			Ext.getCmp("upmod").hide();
			Ext.getCmp("updel").hide();
		}
		if ((rdm == null || rdm == "") && $('picPath') != null) {
			$('picPath').src = "./showPicture.action?flag=noPic";
			clearFormAndSet(rightForm);
			return;
		}
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
			if (res != null) {
				if (res.boxCbm != null) {
					res.boxCbm = res.boxCbm.toFixed(cbmNum);
				}
				rightForm.getForm().setValues(res);
				if (popdom == true) {
					res.picPath = "common/images/noElePicSel.png";
				} else {
					if (!flag) {
						if (type == 'price') {
							res.picPath = "./showPicture.action?flag=price&detailId="
									+ srcId;
						}
						if (type == 'ele') {
							res.picPath = "./showPicture.action?flag=ele&elementId="
									+ srcId;
						}
						if (type == 'order') {
							res.picPath = "./showPicture.action?flag=order&detailId="
									+ srcId;
						}
						if (type == 'given') {
							res.picPath = "./showPicture.action?flag=given&detailId="
									+ srcId;
						}
						if (type == null || type == 'none') {
							res.picPath = "./showPicture.action?flag=noPic";
						}
					} else {
						var rdm = Math.round(Math.random() * 10000);
						res.picPath = "./showPicture.action?flag=order&detailId="
								+ record.id + "&tmp=" + rdm;
					}
				}
				DWRUtil.setValue("picPath", res.picPath);

				typeLv1Box.bindPageValue("CotTypeLv1", "id", res.eleTypeidLv1);
				typeLv2Box.bindPageValue("CotTypeLv2", "id", res.eleTypeidLv2);
				eleFlagBox.setValue(res.eleFlag);
				if (res.eleFlag == 0) {
					Ext.getCmp("eleUnitNum").setDisabled(true);
				}
				// eleHsidBox.bindPageValue("CotEleOther", "id", res.eleHsid);
				boxIbTypeBox.bindValue(res.boxIbTypeId);
				boxMbTypeBox.bindValue(res.boxMbTypeId);
				boxObTypeBox.bindValue(res.boxObTypeId);
				boxPbTypeBox.bindValue(res.boxPbTypeId);
				inputGridTypeIdBox.bindValue(res.inputGridTypeId);
				boxPacking.bindPageValue("CotBoxType", "id", res.boxTypeId);
				facBox.bindPageValue("CotFactory", "id", res.factoryId);
				// 显示原始外销价,重新换算价格
				queryService.updatePrice(res.priceOut, res.priceOutUint,
						$('currencyId').value, function(newPr) {
							Ext.getCmp("oldPrice").setValue(newPr
									.toFixed(outNum));
						});
			}
		});
		DWREngine.setAsync(true);
		if ($('custId').value != '') {
			cotOrderService.findNewPriceVO(eleId, $('custId').value, function(
							ap) {
						Ext.getCmp("newPrice").setValue(ap.newPrice);
						Ext.getCmp("avgPrice").setValue(ap.avgPrice);
						Ext.getCmp("maxPrice").setValue(ap.maxPrice);
						Ext.getCmp("minPrice").setValue(ap.minPrice);
					});
		}
	}

	// 从报价订单送样表格导入时
	this.insertByBatch = function(res, inputType) {
		var newPrice = 0;
		var currencyId = 0;
		if (inputType == 'price') {
			newPrice = res.pricePrice;
			currencyId = res.currencyId;
		}
		if (inputType == 'order') {
			newPrice = res.orderPrice;
			currencyId = res.currencyId;
		}
		if (inputType == 'given') {
			newPrice = res.priceOut;
			currencyId = res.priceOutUint;
		}
		res.orderPrice = newPrice;
		DWREngine.setAsync(false);
		if (currencyId != curBox.getValue()) {
			// 重新换算价格
			queryService.updatePrice(newPrice, currencyId, curBox.getValue(),
					function(newPri) {
						res.orderPrice = newPri.toFixed(deNum);
					});
		}
		res.currencyId = curBox.getValue();
		res.type = inputType;
		res.srcId = res.id;
		res.id = null;
		// 取得随机数
		var rdm = getRandom();
		res.rdm = rdm;
		// 将添加的样品对象储存到后台map中
		cotOrderService.setOrderMap(rdm, res, function(res) {
				});
		setObjToGrid(res);
		DWREngine.setAsync(true);
	}

	// 显示打印面板
	var printWin;
	function showPrint(item) {
		// 添加权限判断
		var isPopedom = getPopedomByOpType("cotorder.do", "PRINT");
		if (isPopedom == 0) {
			Ext.MessageBox
					.alert("Message", 'Sorry, you do not have Authority!');
			return;
		}
		// 如果该单没保存不能打印
		if ($('pId').value == 'null' || $('pId').value == '') {
			Ext.MessageBox.alert("Message",
					'The record has not been preserved, can not print！');
			return;
		}
		if (printWin == null) {
			// 实达打印面板，修改PringWin为PrintWinSD
			// printWin = new PrintWinSD({
			printWin = new PrintWin({
						type : 'order',
						pId : 'pId',
						pNo : 'orderNo',
						mailSendId : 'custId',
						status : 'orderStatus'
					});
		}
		if (!printWin.isVisible()) {
			var po = item.getPosition();
			printWin.setPosition(po[0], po[1] - 190);
			printWin.show();
		} else {
			printWin.hide();
		}
	};

	// 请求审核
	function qingShen() {
		// 如果没有选择审核人
		if ($('shenPerson').value == '') {
			Ext.Msg.alert("Message", "Please Choose Approve Person!");
			return;
		}

		Ext.MessageBox.confirm('Message', "Do you want Approval?",
				function(btn) {
					if (btn == 'yes') {
						cotOrderService.updateOrderStatus($('pId').value, 3,
								$('shenPerson').value, function(res) {
									shenBox.setValue(3);
									reflashParent('orderGrid');
									// 修改人
									Ext.getCmp("modTime").setValue(res);
									modEmpBox.bindPageValue("CotEmps", "id",
											logId);
									// 审核人
									empChkBox.bindPageValue("CotEmps", "id",
											$('shenPerson').value);
									shenPanel.hide();
									Ext.getCmp("qingBtn").hide();
									// 如果是admin直接显示"审核通过"和"审核不通过"按钮
									if (loginEmpId == "admin" || $('shenPerson').value==logId) {
										Ext.getCmp("guoBtn").show();
										// Ext.getCmp("buBtn").show();
									}
								});

					}
				});
	}

	// 审核通过
	function guoShen() {
		// 查询业务配置是否有配置生产价币种
		var chkFlag = false;
		DWREngine.setAsync(false);
		cotOrderService.getList('CotPriceCfg', function(res) {
					if (res.length != 0) {
						if (res[0].facPriceUnit == null) {
							chkFlag = true;
						}
					} else {
						chkFlag = true;
					}
				});
		DWREngine.setAsync(true);
		if (chkFlag) {
			Ext.Msg.alert("Message", "Please Choose PO Currency from Setting！");
			return;
		}
		if ($('orderLcDate').value == '') {
			Ext.Msg.alert("Message", "Please Enter Shipment！");
			return;
		}

		Ext.MessageBox.confirm('Message', "Are you sure Approved the PI?",
				function(btn) {
					if (btn == 'yes') {
						mask();
						// 延时
						var task = new Ext.util.DelayedTask(function() {
							DWREngine.setAsync(false);
							cotOrderService.updateOrderStatus($('pId').value,
									2, null, function(res) {
										// 修改人
										Ext.getCmp("modTime").setValue(res);
										modEmpBox.bindPageValue("CotEmps",
												"id", logId);
										reflashParent('orderGrid');
										Ext.getCmp("showPdfBtn").show();
										// Ext.getCmp("buBtn").hide();

										// 生产PO
										var map = null;
										if (shenBox.getValue() != 2) {
											cotOrderFacService
													.saveOrderFacByDecomposeOrder(
															$('pId').value,
															function(res2) {
																if (res2 != null) {
																	// 批量修改主采购单的总数量,总箱数,总体积,总金额
																	map = res2;
																	cotOrderFacService
																			.modifyFacTotalByMap(
																					map,
																					function(
																							res1) {
																						unmask();
																					});
																} else {
																	unmask();
																}
															})
										} else {
											unmask();
										}
										shenBox.setValue(2);
									});
							DWREngine.setAsync(true);
						});
						task.delay(500);

					}
				});
	}
	
	//在浏览器打开pdf
	//var mailWin = null;
	function showPdf(){
		var mailWin=new Ext.Window({
			title:"Send Email",
			width:400,
			height:109,
			layout:"form",
			id:"mailWin",
			modal:true,
			buttonAlign:"center",
			padding:"10",
			monitorValid : true,
			fbar:[
				{
					text:"Send",
					formBind : true,
					handler:sendMail
				}
			],
			items:[
				{
					xtype:"textfield",
					fieldLabel:"Client Email",
					id:"custMail",
					allowBlank:false,
					vtype:"email",
					anchor:"100%"
				}
			]
		});
		mailWin.show();
		//openEleWindow("./saverptfile/order/"+$('orderNo').value+".pdf");
	}
	function sendMail(){
		var custMail = Ext.getCmp("custMail").getValue();
		mask();
		var task = new Ext.util.DelayedTask(function(){
			contexUtil.sendMail($('orderNo').value,"order",custMail,function(res){
				if(res){
					unmask();
					var win = Ext.getCmp("mailWin");
					win.close();
				}else{
					unmask();
					alert("Send Mail Failed");
				}
			});
		});
		task.delay(500);
		
	}
	// 审核不通过
	function buShen() {
		// var isCheck = getPopedomByOpType("cotorder.do", "CHECK");
		// if (isCheck == 0) {
		// Ext.MessageBox.alert('Message', 'Sorry, you do not have Authority!');
		// return;
		// }
		Ext.MessageBox.confirm('Message', "Are you sure Non-review the order?",
				function(btn) {
					if (btn == 'yes') {
						cotOrderService.updateOrderStatus($('pId').value, 1,
								null, function(res) {
									shenBox.setValue(1);
									// 修改人
									Ext.getCmp("modTime").setValue(res);
									modEmpBox.bindPageValue("CotEmps", "id",
											logId);
									reflashParent('orderGrid');
									Ext.getCmp("guoBtn").hide();
									// Ext.getCmp("buBtn").hide();
							})

					}
				});
	}

	// 保存排序
	function sumSort() {
		var type = $("sortSel").value;
		var field = "";
		var fieldType = 'int';
		if ($("sortXu").checked == true) {
			field = "sortNo";
		}
		if ($("sortEleId").checked == true) {
			field = "eleId";
			fieldType = 'string';
		}
		if ($("sortCustNo").checked == true) {
			field = "custNo";
			fieldType = 'string';
		}
		if ($("pId").value == '' || $("pId").value == 'null') {
			Ext.MessageBox.alert("message",
					"Pls. save the order, and then change the sort!");
			return;
		}
		DWREngine.setAsync(false);
		cotOrderService.updateSortNo($("pId").value, type, field, fieldType,
				function(res) {
					if (res) {
						ds.reload();
						sortPanel.hide();
						Ext.MessageBox.alert('Message', "Sorting success!");
					} else {
						Ext.MessageBox.alert('Message', "Sort failed!");
					}
				});
		DWREngine.setAsync(true);
	}

	// 保存排序
	function sumSortTable() {
		var sort = ds.getSortState();
		if (!sort) {
			Ext.MessageBox.alert("Message",
					"Sort did not change, no need to save!");
			return;
		}
		if ($("pId").value == '' || $("pId").value == 'null') {
			Ext.MessageBox.alert("Message",
					"Pls. save quotes, and then change the sort!");
			return;
		}
		var fieldType = "";
		ds.each(function(rec) {
					var temp = rec.fields.get(sort.field).type;
					fieldType = temp.type;
					return false;
				});
		if (fieldType == 'auto') {
			fieldType = 'string'
		}
		var type = 0;
		if (sort.direction == 'DESC') {
			type = 1;
		}
		DWREngine.setAsync(false);
		cotOrderService.updateSortNo($("pId").value, type, sort.field,
				fieldType, function(res) {
					if (res) {
						ds.reload();
						Ext.MessageBox.alert('Message',
								"Sort successfully saved!");
					} else {
						Ext.MessageBox.alert('Message', "Save order failed!");
					}
				});
		DWREngine.setAsync(true);
	}

	// 显示模板面板
	var sortPanel;
	function showSort(item, pressed) {
		if ($('sortDiv') == null) {
			Ext.DomHelper.append(document.body, {
				html : '<div id="sortDiv" style="position:absolute;z-index:9500;"></div>'
			}, true);
		}
		if (sortPanel == null) {
			sortPanel = new Ext.form.FormPanel({
						title : '重新排序',
						layout : 'form',
						width : 250,
						frame : true,
						labelWidth : 60,
						labelAlign : "right",
						tools : [{
									id : "close",
									handler : function(event, toolEl, p) {
										p.hide();
									}
								}],
						items : [{
									xtype : 'radiogroup',
									fieldLabel : "",
									hideLabel : true,
									items : [{
												boxLabel : '按序号',
												inputValue : 0,
												style : "marginLeft:8",
												name : 'sortType',
												id : "sortXu",
												checked : true
											}, {
												boxLabel : '按货号',
												id : "sortEleId",
												inputValue : 1,
												name : 'sortType'
											}, {
												boxLabel : '按客号',
												id : "sortCustNo",
												inputValue : 2,
												name : 'sortType'

											}]
								}, {
									layout : 'hbox',
									layoutConfig : {
										padding : '5',
										align : 'middle'
									},
									defaults : {
										margins : '0 5 0 0'
									},
									items : [{
												xtype : 'panel',
												flex : 1
											}, sortComb, {
												text : '生成',
												xtype : 'button',
												flex : 1,
												iconCls : 'page_add',
												handler : sumSort
											}, {
												xtype : 'panel',
												flex : 1
											}]
								}]
					});
			var tag = item.getEl();
			var left = Ext.Element.fly(tag).getX();
			var top = Ext.Element.fly(tag).getY();
			Ext.Element.fly("sortDiv").setLeftTop(left, top - 110);
			sortPanel.render("sortDiv");
		} else {
			if (!sortPanel.isVisible()) {
				sortPanel.show();
			} else {
				sortPanel.hide();
			}
		}
	};

	// 添加数据从excel
	this.insertSelectExcel = function(excelFlag) {
		DWREngine.setAsync(false);
		// 得到excel的内存map的key集合
		cotOrderService.getRdmList(function(result) {
			if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {
					insertToGridExcel(result[i], excelFlag);
				}
				// 清空excel内存
				cotOrderService.removeExcelSession(function(ct) {
						});
				var id = $('pId').value;
				var custId = custBox.getValue();
				var currencyId = curBox.getValue();
				// 保存订单明细
				cotOrderService.saveDetail(id, currencyId, custId,
						function(alt) {
							// 加载厂家表缓存
							baseDataUtil.getBaseDicDataMap("CotFactory", "id",
									"shortName", function(res) {
										facData = res;
									});
							// 加载币种表缓存
							baseDataUtil.getBaseDicDataMap("CotCurrency", "id",
									"curNameEn", function(res) {
										curData = res;
									});
							// 加载材质表缓存
							baseDataUtil.getBaseDicDataMap("CotTypeLv1", "id",
									"typeName", function(res) {
										typeData = res;
									});

							// 刷新表格
							ds.proxy.setApi({
								read : "cotorder.do?method=queryOrderDetail&orderId="
										+ id
							});
							ds.load({
										params : {
											start : 0,
											limit : 1000
										}
									});
							unmask();
						});
			}
		});
		DWREngine.setAsync(true);
	}

	// 根据产品货号查找样品数据
	function insertToGridExcel(rdm, excelFlag) {
		// 将计算单价的参数组成一个map
		var mapPrice = {};
		mapPrice.currencyId = $('currencyId').value;// 币种
		mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
		mapPrice.orderProfit = $('orderProfit').value;// 利润率
		mapPrice.orderFob = $('orderFob').value;// FOB
		mapPrice.orderRate = $('orderRate').value;// 汇率
		mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
		mapPrice.insureRate = $('insureRate').value;// 保险费率
		mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
		mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
		// 根据样品货号查找样品
		cotOrderService.findDetailByEleIdExcel(rdm, excelFlag, mapPrice,
				liRunCau, function(result) {
					if (result != null) {
						result.type = 'none';
						result.srcId = 0;
						// 将添加的样品对象储存到后台map中
						cotOrderService.setExcelMap(rdm, result, function(res) {
								});
					}
				});
	}
	this.exlFlag = false;
	this.eFlag;
	this.filename;
	this.isCover;
	// 保存
	this.saveByExcel = function(eFlag, filename, isCover) {
		_self.eFlag = eFlag;
		_self.filename = filename;
		_self.isCover = isCover;
		var popedom = checkAddMod($('pId').value);
		if (popedom == 1) {
			Ext.MessageBox
					.alert('Message', 'Sorry, you do not have Authority!');
			return;
		} else if (popedom == 2) {
			Ext.MessageBox
					.alert('Message', 'Sorry, you do not have Authority!');
			return;
		}
		// 审核通过不让修改
//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox.alert('Message',
//					'Sorry, this order has been reviewed can not be modified!');
//			return;
//		}

		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}

		// 判断是不是需要根据价格公式计算
		if (eFlag) {
			if ($('clauseTypeId').value == '') {
				Ext.MessageBox
						.alert(
								'Message',
								'According to excel configuration, you need to select and configure the corresponding terms of price quotations formula!');
				return;
			}
		}

		var price = DWRUtil.getValues('orderForm');
		var cotOrder = {};
		// 如果编号存在时先查询出对象,再填充表单
		if ($('pId').value != 'null' && $('pId').value != '') {
			DWREngine.setAsync(false);
			cotOrderService.getOrderById($('pId').value, function(res) {
						for (var p in price) {
							if (p != 'orderTime' && p != 'sendTime') {
								res[p] = price[p];
							}
						}
						cotOrder = res;
					});
			DWREngine.setAsync(true);
		} else {
			cotOrder = new CotOrder();
			for (var p in cotOrder) {
				if (p != 'orderTime' && p != 'sendTime') {
					cotOrder[p] = price[p];
				}
			}
		}
		DWREngine.setAsync(false);
		// 唛标
		if (Ext.getCmp("orderZMArea").isVisible()) {
			cotOrder.orderZM = $('orderZMArea').value;
			cotOrder.orderCM = $('orderCMArea').value;
			cotOrder.orderZHM = $('orderZHMArea').value;
			cotOrder.orderNM = $('orderNMArea').value;
			cotOrder.productM = $('productArea').value;
		}
		var oldFlag = false;
		if ($('uploadSuc').value == "0") {
			oldFlag = true;
		}
		cotOrderService.saveOrUpdateOrder(cotOrder, $('orderTime').value,
				$('sendTime').value, oldFlag, function(res) {
					if (res != null) {
						// 当新建时,如果默认配置需要审核,保存后显示"提请审核","另存为"按钮
						if ($('pId').value == 'null') {
							if ($('orderStatus').value == 0) {
								Ext.getCmp("qingBtn").show();
							}
							Ext.getCmp('saveAsBtn').show();
							// if (Ext.getCmp('orderZMArea').isVisible()) {
							// Ext.getCmp('upmodMai').show();
							// Ext.getCmp('updelMai').show();
							// }
						}
						$('pId').value = res;

						// 如果订单明细没有修改
						if (ds.getModifiedRecords().length == 0
								&& ds.removed.length == 0) {
							// 直接导入excel
							saveReport(eFlag, filename, isCover);
							// 修改主单的总数量,总箱数,总体积,总金额
							cotOrderService.modifyCotOrderTotalAction(
									$('pId').value, function(res) {
										if (res != null) {
											$('totalLab').innerText = res[0]
													.toFixed(deNum);
											$('realLab').innerText = res[2]
													.toFixed(deNum);
											$('totalCbmLab').innerText = res[1]
													.toFixed(cbmNum);
											$('totalGrossLab').innerText = res[3]
													.toFixed("3");
										}
									});
						} else {
							// 更改添加action参数
							var urlAdd = '&orderPrimId=' + res + '&currencyId='
									+ $('currencyId').value + '&custId='
									+ $('custId').value;
							// 更改修改action参数
							var urlMod = '&custId=' + $('custId').value
									+ '&currencyId=' + $('currencyId').value;
							ds.proxy.setApi({
								read : "cotorder.do?method=queryOrderDetail&orderId="
										+ res,
								create : "cotorder.do?method=add" + urlAdd,
								update : "cotorder.do?method=modify" + urlMod,
								destroy : "cotorder.do?method=remove"
							});
							_self.exlFlag = true;
							ds.save();
						}
						$('uploadSuc').value = "";
						reflashParent('orderGrid');
					} else {
						Ext.MessageBox.alert('Message', 'Save Failed');
						unmask();
					}
				});
		DWREngine.setAsync(true);
	}

	// 新建
	function windowopen() {
		// 验证表单
		var formData = getFormValues(modlElePanel, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}

		var byId = $('byId').value;
		var myId = $('myId').value;
		var syId = $('syId').value;
		var facId = $('facEleId').value;

		cotSeqService.getEleNo(byId, myId, syId, facId, function(ps) {
					openWindowBase(500, 1020,
							'./cotelements.do?method=addElements&eleNo=' + ps
									+ '&byId=' + byId + '&myId=' + myId
									+ '&syId=' + syId + '&facId=' + facId
									+ '&chk=0');
					modlElePanel.hide();
				});

	}

	// 保存excel
	function saveReport(eFlag, filename, isCover) {
		var infoPanel = Ext.getCmp('infoPanel');
		cotOrderService.saveReport($('pId').value, filename, isCover, curBox
						.getValue(), eFlag, function(msgList) {
					if (msgList == null) {
						infoPanel.body.dom.innerHTML = "File not found or the file is not excel!";
					} else {
						if (msgList.length == 1) {
							if (msgList[0].flag == 1) {
								infoPanel.body.dom.innerHTML = "<font color=red>"
										+ msgList[0].msg + "</font>";
							} else {
								infoPanel.body.dom.innerHTML = "导入成功&nbsp(<label>"
										+ msgList[0].successNum
										+ "</label>)&nbsp条，导入失败&nbsp(<label>"
										+ msgList[0].failNum
										+ "</label>)&nbsp条，覆盖成功&nbsp(<label>"
										+ msgList[0].coverNum + "</label>)条。";
								_self.insertSelectExcel(eFlag);
							}
						} else {
							var htm = '<div class="detail_nav"><label>错误信息(修改excel文件后重新上传)</label></div><div style="height: 360px; overflow: auto;">';
							var temp = '';
							for (var i = 0; i < msgList.length; i++) {
								if (i != msgList.length - 1) {
									htm += "<div id=err"
											+ i
											+ ">第&nbsp("
											+ (msgList[i].rowNum + 1)
											+ ")&nbsp行，第&nbsp("
											+ (msgList[i].colNum + 1)
											+ ")&nbsp列的错误信息："
											+ msgList[i].msg
											+ "&nbsp;&nbsp;<a href=# onclick=reportload("
											+ i + "," + msgList[i].rowNum
											+ ")>【重新上传】</a></div><br/>";
								} else {
									susNum = msgList[i].successNum;
									failNum = msgList[i].failNum;
									temp = '导入成功&nbsp(<label id="successNumLab">'
											+ msgList[i].successNum
											+ "</label>)&nbsp条，导入失败&nbsp(<label id='failNumLab'>"
											+ msgList[i].failNum
											+ "</label>)&nbsp条，覆盖成功&nbsp(<label id='coverNumLab'>"
											+ msgList[i].coverNum
											+ "</label>)条。";
									if (susNum > 0 || msgList[i].coverNum > 0) {
										_self.insertSelectExcel(eFlag);
									}
								}
							}
							infoPanel.body.dom.innerHTML = temp + '</div>'
									+ htm;
						}
					}
				});
	}

	// 单价值改变事件
	function firePriceOutChange(rec, newVal) {
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			// 将计算单价的参数组成一个map
			var mapPrice = {};
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.orderProfit = $('orderProfit').value;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
			mapPrice.price = newVal;
			cotOrderService.getNewLiRun(mapPrice, rdm, function(res) {
						if (res != null) {
							rec.set("liRun", res);
							updateMapValue(rdm, "liRun", res);
						}
					});
			if (!rec.data.boxCount) {
				rec.data.boxCount = 0;
			}
			var boxCount = rec.data.boxCount;
			var total = boxCount * newVal;
			// 重新计算总价
			$('totalLab').innerText = (parseFloat($('totalLab').innerText)
					- rec.data.totalMoney + boxCount * newVal).toFixed(deNum);

			$('realLab').innerText = (parseFloat($('realLab').innerText)
					- rec.data.totalMoney + boxCount * newVal).toFixed('2');

			rec.set("totalMoney", total.toFixed('2'));
			updateMapValue(rdm, "orderPrice", newVal);
			updateMapValue(rdm, "totalMoney", total);
		}

	}

	// 双击历史事件表格更新报价事件
	function replacePrice(hisGrid, index) {
		var hisrec = hisGrid.getStore().getAt(index);
		var hisprice = hisrec.get("orderPrice");
		var pricerec = sm.getSelected();
		pricerec.set("orderPrice", hisprice.toFixed(deNum))
		firePriceOutChange(pricerec, hisprice.toFixed(deNum));
		var hisWin = Ext.getCmp("hisWin");
		hisWin.close();
		// var urlAdd = '&orderPrimId=' + $('pId').value + '&currencyId='
		// + $('currencyId').value + '&custId=' + $('custId').value;
		// // 更改修改action参数
		// var urlMod = '&custId=' + $('custId').value + '&currencyId='
		// + $('currencyId').value;
		// ds.proxy.setApi({
		// read : "cotorder.do?method=queryOrderDetail&orderId="
		// + $('pId').value,
		// create : "cotorder.do?method=add" + urlAdd,
		// update : "cotorder.do?method=modify" + urlMod,
		// destroy : "cotorder.do?method=remove"
		// });
		// ds.save();
	}

	// 打开盘点机上传面板
	function showPanPanel() {
		var id = $('pId').value;
		if (id == 'null' || id == '') {
			Ext.MessageBox
					.alert('Message',
							'Please save the order! Machine file and then import the inventory！');
			return;
		}
		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return;
		}
		// 判断表格是否有未保存的数据
		if (ds.getModifiedRecords().length != 0 || ds.removed.length != 0) {
			Ext.MessageBox
					.alert(
							'Message',
							'Order Details data has changed, please save! Machine file and then import the inventory！');
			return;
		}

		var win = new UploadPan({
					waitMsg : "uploading......",
					uploadUrl : './uploadOrderMachine.action',
					validType : "txt|cvs",
					pWin : _self
				})
		win.show();
	}

	// 打开图片上传面板
	function showUploadPanel() {
		var eleId = $('eleId').value;
		if (eleId == '') {
			Ext.MessageBox.alert('Message',
					'Pls. select one Order Details records!');
			return;
		}

		var id = $('id').value;
		var opAction = "insert";
		if (id == 'null' || id == '')
			opAction = "insert";
		else
			opAction = "modify";
		var win = new UploadWin({
					params : {
						detailId : id,
						flag : 'order'
					},
					waitMsg : "Photo upload......",
					opAction : opAction,
					imgObj : $('picPath'),
					imgUrl : "./showPicture.action?detailId=" + id
							+ "&flag=order&temp=" + Math.random(),
					uploadType : "image",
					loadImgStream : true,
					uploadUrl : './uploadTempPic.action',
					validType : "jpg|png|bmp|gif",
					returnFlag : true
				})
		win.show();
	}

	// 打开上传面板,用于上次唛标
	function showUploadMaiPanel() {
		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
			Ext.MessageBox
					.alert('Message',
							'Sorry, this record has been reviewed can not be modified!');
			return;
		}
		var id = $('pId').value;
		var win = new UploadWin({
					params : {
						mainId : id
					},
					waitMsg : "Photo upload......",
					opAction : "modify",
					imgObj : $('order_MB'),
					imgUrl : "./showPicture.action?detailId=" + id
							+ "&flag=orderMB&temp=" + Math.random(),
					uploadType : "image",
					loadImgStream : true,
					uploadUrl : './uploadMBPic.action',
					validType : "jpg|png|bmp|gif"
				})
		win.show();
	}

	// 打开上传面板,用于上次产品标
	function showUploadProductPanel() {
		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
			Ext.MessageBox.alert('Message',
					'Sorry,this record has been reviewed can not be modified!');
			return;
		}
		var id = $('pId').value;
		var win = new UploadWin({
					params : {
						mainId : id
					},
					waitMsg : "Photo upload......",
					opAction : "modify",
					imgObj : $('product_MB'),
					imgUrl : "./showPicture.action?detailId=" + id
							+ "&flag=productMB&temp=" + Math.random(),
					uploadType : "image",
					loadImgStream : true,
					uploadUrl : './uploadProMBPic.action',
					validType : "jpg|png|bmp|gif"
				})
		win.show();
	}

	// 删除图片
	function delPic() {
//		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
//			Ext.MessageBox.alert('Message',
//					'Sorry,this record has been reviewed can not be modified!');
//			return;
//		}
		var eleId = $('eleId').value;
		if (eleId == '') {
			Ext.MessageBox.alert('Message',
					'Pls. select one Order Details records!');
			return;
		}
		Ext.MessageBox.confirm('Message',
				"Are you sure you want to delete this Picture?", function(btn) {
					if (btn == 'yes') {
						var detailId = $('id').value;
						cotOrderService.deletePicImg(detailId, function(res) {
									if (res) {
										$('picPath').src = "common/images/zwtp.png";
									} else {
										Ext.MessageBox.alert('Message',
												'Remove image failed!');
									}
								})
					}
				});
	}

	// 删除产品标图片
	function delProductMBPic() {
		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
			Ext.MessageBox
					.alert('Message',
							'Sorry, this record has been reviewed can not be modified!');
			return;
		}
		Ext.MessageBox.confirm('Message', "Are you sure you remove the Label?",
				function(btn) {
					if (btn == 'yes') {
						var pId = $('pId').value;
						cotOrderService.deleteProductMBPicImg(pId,
								function(res) {
									if (res) {
										$('product_MB').src = "common/images/zwtp.png";
									} else {
										Ext.MessageBox.alert('Message',
												'Delete lable failed!');
									}
								})
					}
				});
	}

	// 删除唛标图片
	function delMBPic() {
		if ($('orderStatus').value == 2 && loginEmpId != "admin") {
			Ext.MessageBox
					.alert('Message',
							'Sorry, this record has been reviewed can not be modified!');
			return;
		}
		Ext.MessageBox.confirm('Message', "Are you sure you want to delete?",
				function(btn) {
					if (btn == 'yes') {
						var pId = $('pId').value;
						cotOrderService.deleteMBPicImg(pId, function(res) {
									if (res) {
										$('order_MB').src = "common/images/zwtp.png";
									} else {
										Ext.MessageBox.alert('Message',
												'Delete failed');
									}
								})
					}
				});
	}

	// 先计算货款金额,再重新计算实际金额(实际金额=货款金额-折扣+加减费用)
	function sumRealMoney(newVal, oldVal) {
		var oldTxt = Number($('totalLab').innerText);
		if (oldVal == '' || isNaN(oldVal)) {
			oldVal = 100;
		}
		var temp = oldTxt.div(oldVal).mul(newVal);
		// 先根据旧折扣率还原价格,再按新折扣打折
		$('totalLab').innerText = temp.toFixed(deNum);
		var orderId = $("pId").value;
		// 新增时没有加减费用
		if (orderId == 'null' || orderId == '') {
			$('realLab').innerText = temp.toFixed(deNum);
		} else {
			var currencyId = $("currencyId").value;
			if (currencyId == "") {
				currencyId = null;
			}
			DWREngine.setAsync(false);
			// 得到加减费用总和
			cotOrderService.getRealMoney(orderId, currencyId,
					function(jiaMoney) {
						$("realLab").innerText = temp.add(jiaMoney)
								.toFixed(deNum);
					});
			DWREngine.setAsync(true);
		}
	}

	// 判断打折类型
	function checkZheType(txt, newVal, oldVal) {
		var newNum = 100;
		if (newVal != '' && !isNaN(newVal) && newVal != 0) {
			newNum = newVal;
		}
		var zheType = $('zheType').value;

		if (zheType == 2) {
			sumRealMoney(newNum, oldVal);
		} else {
			if (zheType == 0) {
				$('zheNum').value = '';
				newNum = 100;
			}
			// 将计算单价的参数组成一个map
			var mapPrice = {};
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.orderProfit = $('orderProfit').value;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型

			// 修改表格中的单价
			ds.each(function(rec) {
						var ck = rec.data.checkFlag;
						if (ck == null || ck == 0 || ck == false) {
							var rdm = rec.data.rdm;
							if (rdm != null && rdm != "") {
								var orderPrice = Number(rec.data.orderPrice);
								var price = 0;
								if (orderPrice != '') {
									price = orderPrice;
								}
								// 先算出扣除折扣后的原始价
								if (price != 0 && oldVal != 100 && oldVal != '') {
									price = price.div(oldVal.mul(0.01));
								}
								// 计算单价
								price = (price.mul(newNum).mul(0.01))
										.toFixed(deNum);
								if (!rec.data.boxCount) {
									rec.data.boxCount = 0;
								}
								// 计算总金额
								var total = (price * rec.data.boxCount)
										.toFixed(deNum);
								rec.set('orderPrice', price);
								rec.set('totalMoney', total);
								updateMapValue(rdm, "orderPrice", price);
								updateMapValue(rdm, "totalMoney", total);
								mapPrice.price = price;
								cotOrderService.getNewLiRun(mapPrice, rdm,
										function(res) {
											if (res != null) {
												rec.set("liRun", res);
												updateMapValue(rdm, "liRun",
														res);
											}
										});
							}
						}
					});
			// 计算货款金额
			var temp = Number(summary.getSumTypeValue('totalMoney'));
			$('totalLab').innerText = temp.toFixed(deNum);
			var orderId = $("pId").value;
			// 新增时没有加减费用
			if (orderId == 'null' || orderId == '') {
				$('realLab').innerText = temp.toFixed(deNum);
			} else {
				var currencyId = $("currencyId").value;
				if (currencyId == "") {
					currencyId = null;
				}
				DWREngine.setAsync(false);
				// 得到加减费用总和
				cotOrderService.getRealMoney(orderId, currencyId, function(
								jiaMoney) {
							$("realLab").innerText = temp.add(jiaMoney)
									.toFixed(deNum);
						});
				DWREngine.setAsync(true);
			}

		}
	}

	// 折扣类型改变时
	function sumZhe(com, newVal, oldVal) {
		var newNum = 100;
		if ($('zheNum').value != '' && !isNaN($('zheNum').value)
				&& $('zheNum').value != 0) {
			newNum = $('zheNum').value;
		}
		if (newNum == 100) {
			return;
		}
		// 1如果原先是不打折,这次是按总额
		if (oldVal == 0 && newVal == 2) {
			// 更改货款金额和实际金额
			sumRealMoney(newNum, 100);
		}

		// 2如果原先是不打折,这次是按单价
		if (oldVal == 0 && newVal == 1) {
			// 更改单价
			checkZheType($('zheNum'), newNum, 100);
		}

		// 3如果原先是按单价,这次是按总额
		if (oldVal == 1 && newVal == 2) {
			// 还原单价
			// 将计算单价的参数组成一个map
			var mapPrice = {};
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.orderProfit = $('orderProfit').value;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型

			// 修改表格中的单价
			ds.each(function(rec) {
						var ck = rec.data.checkFlag;
						if (ck == null || ck == 0 || ck == false) {
							var rdm = rec.data.rdm;
							if (rdm != null && rdm != "") {
								var orderPrice = rec.data.orderPrice;
								var price = 0;
								if (orderPrice != '') {
									price = orderPrice;
								}
								// 先算出扣除折扣后的原始价
								if (price != 0) {
									price = price.div(newNum.mul(0.01));
								}
								// 计算单价
								price = price.toFixed(deNum);
								if (!rec.data.boxCount) {
									rec.data.boxCount = 0;
								}
								// 计算总金额
								var total = (price.mul(rec.data.boxCount))
										.toFixed(deNum);
								rec.set('orderPrice', price);
								rec.set('totalMoney', total);
								updateMapValue(rdm, "orderPrice", price);
								updateMapValue(rdm, "totalMoney", total);
								mapPrice.price = price;
								cotOrderService.getNewLiRun(mapPrice, rdm,
										function(res) {
											if (res != null) {
												rec.set("liRun", res);
												updateMapValue(rdm, "liRun",
														res);
											}
										});
							}
						}
					});
			// 计算货款金额
			var temp = Number(summary.getSumTypeValue('totalMoney'));
			var as = (temp.mul(newNum).mul(0.01)).toFixed(deNum);
			$('totalLab').innerText = as;
			var orderId = $("pId").value;
			// 新增时没有加减费用
			if (orderId == 'null' || orderId == '') {
				$('realLab').innerText = as;
			} else {
				var currencyId = $("currencyId").value;
				if (currencyId == "") {
					currencyId = null;
				}
				DWREngine.setAsync(false);
				// 得到加减费用总和
				cotOrderService.getRealMoney(orderId, currencyId, function(
								jiaMoney) {
							$("realLab").innerText = Number(as).add(jiaMoney)
									.toFixed(deNum);
						});
				DWREngine.setAsync(true);
			}

		}

		// 4如果原先是按总金额,这次是按单价
		if (oldVal == 2 && newVal == 1) {
			// 还原货款金额和实际金额
			// sumRealMoney(100, newNum);
			// 更改单价
			checkZheType($('zheNum'), newNum, 100);
		}

		// 5如果原先是按总金额,这次是不打折
		if (oldVal == 2 && newVal == 0) {
			// 还原货款金额和实际金额
			sumRealMoney(100, newNum);
		}

		// 6如果原先是按单价,这次是不打折
		if (oldVal == 1 && newVal == 0) {
			// 还原单价
			checkZheType($('zheNum'), 100, newNum);
		}
		if (newVal == 0) {
			$('zheNum').value = '';
		}
	}

	// 更新内存数据,并修改右边表单数据
	function updateMapValue(rdm, property, value) {
		DWREngine.setAsync(false);
		cotOrderService.updateMapValueByEleId(rdm, property, value, function(
						res) {
					if (rightForm.isVisible()) {
						var field = rightForm.getForm().findField(property);
						if (field != null) {
							field.setValue(value);
						}
					}
				});
		DWREngine.setAsync(true);
	}

	// 不修改内存,只修改右边表单数据
	function rightChange(field, value) {
		if (rightForm.isVisible()) {
			var txt = rightForm.getForm().findField(field);
			if (txt != null) {
				txt.setValue(value);
			}
		}
	}

	// 单价值改变事件
	function priceOutChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			// 将计算单价的参数组成一个map
			var mapPrice = {};
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.orderProfit = $('orderProfit').value;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
			mapPrice.price = newVal;
			cotOrderService.getNewLiRun(mapPrice, rdm, function(res) {
						if (res != null) {
							rec.set("liRun", res);
							updateMapValue(rdm, "liRun", res);
						}
					});
			if (!rec.data.boxCount) {
				rec.data.boxCount = 0;
			}
			var boxCount = rec.data.boxCount;
			var total = boxCount * newVal;
			// 重新计算总价
			$('totalLab').innerText = (parseFloat($('totalLab').innerText)
					- rec.data.totalMoney + boxCount * newVal).toFixed(deNum);

			$('realLab').innerText = (parseFloat($('realLab').innerText)
					- rec.data.totalMoney + boxCount * newVal).toFixed('2');

			rec.set("totalMoney", total.toFixed('2'));
			updateMapValue(rdm, "orderPrice", newVal);
			updateMapValue(rdm, "totalMoney", total);
		}

	}

	// 单重改变事件
	function boxWeigthChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			updateMapValue(rdm, "boxWeigth", newVal);
			var boxObCount = rec.data.boxObCount;
			if (boxObCount == "") {
				boxObCount = 0;
			}
			cotElementsService.getDefaultList(function(res) {
				var jin = newVal * boxObCount / 1000;
				var boxGrossWeigth = 0;
				if (res.length != 0) {
					if (res[0].grossNum != null) {
						var temp = jin + res[0].grossNum;
						boxGrossWeigth = temp.toFixed(3);
					}
				} else {
					boxGrossWeigth = jin.toFixed(3);
				}
				// 计算总毛重
				var containerCount = rec.data.containerCount;
				var totalGross = boxGrossWeigth * containerCount;

				rec.set("boxNetWeigth", jin.toFixed(3));
				rec.set("boxGrossWeigth", boxGrossWeigth);

				rightChange('boxNetWeigth', jin.toFixed(3));
				rightChange('boxGrossWeigth', boxGrossWeigth);
				updateMapValue(rdm, "boxNetWeigth", jin.toFixed(3));
				updateMapValue(rdm, "boxGrossWeigth", boxGrossWeigth);
				// 重新计算总毛重
				$('totalGrossLab').innerText = (parseFloat($('totalGrossLab').innerText)
						- rec.data.totalGrossWeigth + totalGross).toFixed('3');
				rec.set("totalGrossWeigth", totalGross);
				// 计算总价
				updateMapValue(rdm, "totalGrossWeigth", totalGross);

			});
		}
	}

	// 单价利润率改变事件
	function liRunChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			updateMapValue(rdm, "liRun", newVal);
			var ck = rec.data.checkFlag;
			if (ck == null || ck == 0 || ck == false) {
				// 将计算单价的参数组成一个map
				var mapPrice = {};
				mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
				mapPrice.currencyId = $('currencyId').value;// 币种
				mapPrice.orderProfit = newVal;// 利润率
				mapPrice.orderFob = $('orderFob').value;// FOB
				mapPrice.orderRate = $('orderRate').value;// 汇率
				mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
				mapPrice.insureRate = $('insureRate').value;// 保险费率
				mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
				mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
				cotOrderService.getNewPriceByLiRun(mapPrice, rdm,
						function(res) {
							if (res != null) {
								rec.set("orderPrice", res.toFixed(deNum));
								updateMapValue(rdm, "orderPrice", res
												.toFixed(deNum));
							}
						})
			}
		}
	}

	// 退税率改变事件
	function tuiLvChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			updateMapValue(rdm, "tuiLv", newVal);
			var ck = rec.data.checkFlag;
			if (ck == null || ck == 0 || ck == false) {
				// 将计算单价的参数组成一个map
				var mapPrice = {};
				mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
				mapPrice.currencyId = $('currencyId').value;// 币种
				mapPrice.orderProfit = rec.data.liRun;// 利润率
				mapPrice.tuiLv = newVal;// 退税率
				mapPrice.orderFob = $('orderFob').value;// FOB
				mapPrice.orderRate = $('orderRate').value;// 汇率
				mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
				mapPrice.insureRate = $('insureRate').value;// 保险费率
				mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
				mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
				cotOrderService.getNewPriceByTuiLv(mapPrice, rdm,
						function(res) {
							if (res != null) {
								rec.set("orderPrice", res.toFixed(deNum));
								updateMapValue(rdm, "orderPrice", res
												.toFixed(deNum));
							}
						})
			}
		}
	}

	// 生产价改变事件
	function priceFacChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			updateMapValue(rdm, "priceFac", newVal.toFixed(facNum));
			var ck = rec.data.checkFlag;
			if (ck == null || ck == 0 || ck == false) {
				// 将计算单价的参数组成一个map
				var mapPrice = {};
				mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
				mapPrice.currencyId = $('currencyId').value;// 币种
				mapPrice.orderProfit = rec.data.liRun;// 利润率
				mapPrice.priceFac = newVal;// 生产价
				mapPrice.orderFob = $('orderFob').value;// FOB
				mapPrice.orderRate = $('orderRate').value;// 汇率
				mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
				mapPrice.insureRate = $('insureRate').value;// 保险费率
				mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
				mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
				cotOrderService.getNewPriceByPriceFac(mapPrice, rdm, function(
						res) {
					if (res != null) {
						rec.set("orderPrice", res.toFixed(deNum));
						updateMapValue(rdm, "orderPrice", res.toFixed(deNum));
						if (!rec.data.boxCount) {
							rec.data.boxCount = 0;
						}
						// 改变总金额
						var boxCount = rec.data.boxCount;
						var total = boxCount * res;

						// 重新计算总价
						sumMage(rec.data.totalMoney, total);

						rec.set("totalMoney", total.toFixed(deNum));
						updateMapValue(rdm, "totalMoney", total.toFixed(deNum));
					} else {
						// 没有配置价格条款对应的公式时.或计算公式有误返回null
						// 当配件改变时,会调用该方法,必须触发表格修改事件
						var temp = rec.data.rdm;
						rec.set("rdm", temp + "aaa");
						rec.set("rdm", temp);
					}
				})
			}
		}
	}

	// 生产价币种改变事件
	function priceFacUintChange(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			updateMapValue(rdm, "priceFacUint", newVal);
			var ck = rec.data.checkFlag;
			if (ck == null || ck == 0 || ck == false) {
				// 将计算单价的参数组成一个map
				var mapPrice = {};
				mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
				mapPrice.currencyId = $('currencyId').value;// 币种
				mapPrice.orderProfit = rec.data.liRun;// 利润率
				mapPrice.priceFacUint = newVal;// 生产价币种
				mapPrice.orderFob = $('orderFob').value;// FOB
				mapPrice.orderRate = $('orderRate').value;// 汇率
				mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
				mapPrice.insureRate = $('insureRate').value;// 保险费率
				mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
				mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
				cotOrderService.getNewPriceByPriceFacUint(mapPrice, rdm,
						function(res) {
							if (res != null) {
								rec.set("orderPrice", res.toFixed(deNum));
								updateMapValue(rdm, "orderPrice", res
												.toFixed(deNum));
								if (!rec.data.boxCount) {
									rec.data.boxCount = 0;
								}
								// 改变总金额
								var boxCount = rec.data.boxCount;
								var total = boxCount * res;
								// 重新计算总价
								$('totalLab').innerText = (parseFloat($('totalLab').innerText)
										- rec.data.totalMoney + total)
										.toFixed(deNum);

								$('realLab').innerText = (parseFloat($('realLab').innerText)
										- rec.data.totalMoney + total)
										.toFixed(deNum);

								rec.set("totalMoney", total.toFixed('2'));
								updateMapValue(rdm, "totalMoney", total);
							}
						});
			}
		}
	}

	// 内装数改变事件
	function boxIcountNum(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm == null || rdm == "") {
			return;
		}
		updateMapValue(rdm, "boxIbCount", newVal);
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
					if (res != null) {
						// 1.计算包材价格
						DWREngine.setAsync(false);
						cotOrderService.calPriceAll(rdm, function(def) {
									if (def != null) {
										res.boxIbPrice = def[1];
										res.packingPrice = def[4];
										if (def[5] != -1) {
											res.priceFac = def[5];
											rec.set("priceFac", def[5]);
										}
									}
								});
						DWREngine.setAsync(true);
						// 将对象储存到后台map中
						cotOrderService.setOrderMap(rdm, res, function(res) {
								});
					}
				});
		DWREngine.setAsync(true);
	}

	// 中装数改变事件
	function boxMcountNum(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm == null || rdm == "") {
			return;
		}
		updateMapValue(rdm, "boxMbCount", newVal);
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
					if (res != null) {
						// 1.计算包材价格
						DWREngine.setAsync(false);
						cotOrderService.calPriceAll(rdm, function(def) {
									if (def != null) {
										res.boxMbPrice = def[2];
										res.packingPrice = def[4];
										if (def[5] != -1) {
											res.priceFac = def[5];
											rec.set("priceFac", def[5]);
										}
									}
								});
						DWREngine.setAsync(true);
						// 将对象储存到后台map中
						cotOrderService.setOrderMap(rdm, res, function(res) {
								});
					}
				});
		DWREngine.setAsync(true);
	}

	// 外箱数值改变事件
	function boxOcountNum(newVal, oldVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm == null || rdm == "") {
			return;
		}
		if (newVal == '' || isNaN(newVal)) {
			newVal = 0;
		}
		updateMapValue(rdm, "boxObCount", newVal);

		cotOrderService.getOrderMapValue(rdm, function(res) {
			if (res != null) {
				var tip = 0;
				var con20 = $('con20').value;
				var con40H = $('con40H').value;
				var con40 = $('con40').value;
				var con45 = $('con45').value;
				// 0.计算箱数
				var boxCbm = rec.data.boxCbm;
				if (boxCbm == 0) {
					boxCbm = 0.0001;
				}
				// 数量不变,计算出箱数
				var boxCount = rec.data.boxCount;
				var cot = 0;
				if (newVal != 0) {
					// 计算箱数
					if (boxCount % newVal != 0) {
						cot = parseInt(boxCount / newVal) + 1;
						// 如果没满箱是否重算数量
						tip = 1;
					} else {
						cot = boxCount / newVal;
					}
				}

				var box20Count = Math.floor(con20 / boxCbm) * newVal;
				var box40Count = Math.floor(con40 / boxCbm) * newVal;
				var box40hqCount = Math.floor(con40H / boxCbm) * newVal;
				var box45Count = Math.floor(con45 / boxCbm) * newVal;

				rec.set('containerCount', cot);

				res.containerCount = cot;
				res.box20Count = box20Count;
				res.box40Count = box40Count;
				res.box40hqCount = box40hqCount;
				res.box45Count = box45Count;
				// 1.计算毛净重
				DWREngine.setAsync(false);
				cotElementsService.getDefaultList(function(dfg) {
							var gross = res.boxWeigth * newVal / 1000;
							if (dfg.length != 0) {
								if (dfg[0].grossNum != null) {
									gross += dfg[0].grossNum;
								}
							}
							res.boxNetWeigth = res.boxWeigth * newVal / 1000;
							res.boxGrossWeigth = gross;
							rec.set("boxNetWeigth", res.boxNetWeigth);
							rec.set("boxGrossWeigth", res.boxGrossWeigth);
							rightChange("boxNetWeigth", res.boxNetWeigth);
							rightChange("boxGrossWeigth", res.boxGrossWeigth);
						});
				DWREngine.setAsync(true);

				// 将对象储存到后台map中
				cotOrderService.setOrderMap(rdm, res, function(res) {
						});
				if (tip == 1) {
					var tip = new Ext.ToolTip({
						title : 'Message',
						anchor : 'top',
						html : 'Order Details section is not filled with a box！'
					});
					tip.showAt([ckX - 600, ckY + 30]);
				}
			}
		});
	}

	// 根据明细中的外箱长改变事件
	function changeBoxObL(newVal, type, inch) {
		var rec = null;
		var rdm;
		if (type) {
			rdm = $('rdm').value;
			// 在表格中查找rdm所在的行
			var index = ds.find('rdm', rdm);
			if (index != -1) {
				rec = ds.getAt(index);
			} else {
				return;
			}
		} else {
			rec = editRec;
			rdm = rec.data.rdm;
			if (rdm == null || rdm == "") {
				return;
			}
		}
		if (typeof(inch) != 'undefined') {
			rec.set("boxObL", newVal);
		}
		updateMapValue(rdm, "boxObL", newVal);
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
					if (res != null) {
						var boxObCount = rec.data.boxObCount;// 外装数
						var w = rec.data.boxObW;// 外箱宽
						var h = rec.data.boxObH;// 外箱高
						if (boxObCount == null)
							boxObCount = 0;
						if (w == null)
							w = 0;
						if (h == null)
							h = 0;

						var boxObLInch = (Number(newVal).div(2.54))
								.toFixed("2");// 外箱英寸长
						var cbm = (newVal * w * h * 0.000001).toFixed(cbmNum);
						if (cbm == 0) {
							cbm = 0.0001;
						}

						var con20 = $('con20').value;
						var con40H = $('con40H').value;
						var con40 = $('con40').value;
						var con45 = $('con45').value;
						var box20Count = 0;
						var box40Count = 0;
						var box40hqCount = 0;
						var box45Count = 0;
						box20Count = Math.floor(con20 / cbm) * boxObCount;
						box40Count = Math.floor(con40 / cbm) * boxObCount;
						box40hqCount = Math.floor(con40H / cbm) * boxObCount;
						box45Count = Math.floor(con45 / cbm) * boxObCount;

						res.boxObL = newVal;
						res.boxObLInch = boxObLInch;
						res.boxCbm = cbm;
						res.boxCuft = (cbm * 35.315).toFixed("3");
						res.box20Count = box20Count;
						res.box40Count = box40Count;
						res.box40hqCount = box40hqCount;
						res.box45Count = box45Count;
						rec.set("boxCbm", cbm);

						rightChange("boxCbm", cbm);
						rightChange("boxObLInch", boxObLInch);
						rightChange("boxCuft", (cbm * 35.315).toFixed("3"));
						rightChange("box20Count", box20Count);
						rightChange("box40Count", box40Count);
						rightChange("box40hqCount", box40hqCount);
						rightChange("box45Count", box45Count);
						// 箱数
						var containerCount = rec.data.containerCount;
						// 总体积
						var totalCbm = cbm * containerCount;
						rec.set("totalCbm", totalCbm);
						res.totalCbm = totalCbm;

						// 计算包材价格
						DWREngine.setAsync(false);
						cotOrderService.calPriceAll(rdm, function(def) {
									if (def != null) {
										res.boxPbPrice = def[0];
										res.boxIbPrice = def[1];
										res.boxMbPrice = def[2];
										res.boxObPrice = def[3];
										res.packingPrice = def[4];
										if (def[5] != -1) {
											res.priceFac = def[5];
											rec.set("priceFac", def[5]);
										}
									}
								});
						DWREngine.setAsync(true);
						// 将对象储存到后台map中
						cotOrderService.setOrderMap(rdm, res, function(res) {
								});
					}
				});
		DWREngine.setAsync(true);
	}

	// 根据明细中的外箱宽改变事件
	function changeBoxObW(newVal, type, inch) {
		var rec = null;
		var rdm;
		if (type) {
			rdm = $('rdm').value;
			// 在表格中查找rdm所在的行
			var index = ds.find('rdm', rdm);
			if (index != -1) {
				rec = ds.getAt(index);
			} else {
				return;
			}
		} else {
			rec = editRec;
			rdm = rec.data.rdm;
			if (rdm == null || rdm == "") {
				return;
			}
		}
		if (typeof(inch) != 'undefined') {
			rec.set("boxObW", newVal);
		}
		updateMapValue(rdm, "boxObW", newVal);
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
					if (res != null) {
						var boxObCount = rec.data.boxObCount;// 外装数
						var L = rec.data.boxObL;// 外箱长
						var h = rec.data.boxObH;// 外箱高

						if (boxObCount == null)
							boxObCount = 0;
						if (L == null)
							L = 0;
						if (h == null)
							h = 0;

						var boxObWInch = (Number(newVal).div(2.54))
								.toFixed("2");// 外箱英寸宽
						var cbm = (newVal * L * h * 0.000001).toFixed(cbmNum);
						if (cbm == 0) {
							cbm = 0.0001;
						}

						var con20 = $('con20').value;
						var con40H = $('con40H').value;
						var con40 = $('con40').value;
						var con45 = $('con45').value;
						var box20Count = 0;
						var box40Count = 0;
						var box40hqCount = 0;
						var box45Count = 0;
						box20Count = Math.floor(con20 / cbm) * boxObCount;
						box40Count = Math.floor(con40 / cbm) * boxObCount;
						box40hqCount = Math.floor(con40H / cbm) * boxObCount;
						box45Count = Math.floor(con45 / cbm) * boxObCount;

						res.boxObW = newVal;
						res.boxObWInch = boxObWInch;
						res.boxCbm = cbm;
						res.boxCuft = (cbm * 35.315).toFixed("3");
						res.box20Count = box20Count;
						res.box40Count = box40Count;
						res.box40hqCount = box40hqCount;
						res.box45Count = box45Count;
						rec.set("boxCbm", cbm);

						rightChange("boxCbm", cbm);
						rightChange("boxObWInch", boxObWInch);
						rightChange("boxCuft", (cbm * 35.315).toFixed("3"));
						rightChange("box20Count", box20Count);
						rightChange("box40Count", box40Count);
						rightChange("box40hqCount", box40hqCount);
						rightChange("box45Count", box45Count);
						// 箱数
						var containerCount = rec.data.containerCount;
						// 总体积
						var totalCbm = cbm * containerCount;
						rec.set("totalCbm", totalCbm);
						res.totalCbm = totalCbm;

						// 计算包材价格
						DWREngine.setAsync(false);
						cotOrderService.calPriceAll(rdm, function(def) {
									if (def != null) {
										res.boxPbPrice = def[0];
										res.boxIbPrice = def[1];
										res.boxMbPrice = def[2];
										res.boxObPrice = def[3];
										res.packingPrice = def[4];
										if (def[5] != -1) {
											res.priceFac = def[5];
											rec.set("priceFac", def[5]);
										}
									}
								});
						DWREngine.setAsync(true);
						// 将对象储存到后台map中
						cotOrderService.setOrderMap(rdm, res, function(res) {
								});
					}
				});
		DWREngine.setAsync(true);
	}

	// 根据明细中的外箱高改变事件
	function changeBoxObH(newVal, type, inch) {
		var rec = null;
		var rdm;
		if (type) {
			rdm = $('rdm').value;
			// 在表格中查找rdm所在的行
			var index = ds.find('rdm', rdm);
			if (index != -1) {
				rec = ds.getAt(index);
			} else {
				return;
			}
		} else {
			rec = editRec;
			rdm = rec.data.rdm;
			if (rdm == null || rdm == "") {
				return;
			}
		}
		if (typeof(inch) != 'undefined') {
			rec.set("boxObH", newVal);
		}
		updateMapValue(rdm, "boxObH", newVal);
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
					if (res != null) {
						var boxObCount = rec.data.boxObCount;// 外装数
						var L = rec.data.boxObL;// 外箱长
						var w = rec.data.boxObW;// 外箱宽

						if (boxObCount == null)
							boxObCount = 0;
						if (L == null)
							L = 0;
						if (w == null)
							w = 0;

						var boxObHInch = (Number(newVal).div(2.54))
								.toFixed("2");// 外箱英寸高
						var cbm = (newVal * L * w * 0.000001).toFixed(cbmNum);
						if (cbm == 0) {
							cbm = 0.0001;
						}

						var con20 = $('con20').value;
						var con40H = $('con40H').value;
						var con40 = $('con40').value;
						var con45 = $('con45').value;
						var box20Count = 0;
						var box40Count = 0;
						var box40hqCount = 0;
						var box45Count = 0;
						box20Count = Math.floor(con20 / cbm) * boxObCount;
						box40Count = Math.floor(con40 / cbm) * boxObCount;
						box40hqCount = Math.floor(con40H / cbm) * boxObCount;
						box45Count = Math.floor(con45 / cbm) * boxObCount;

						res.boxObH = newVal;
						res.boxObHInch = boxObHInch;
						res.boxCbm = cbm;
						res.boxCuft = (cbm * 35.315).toFixed("3");
						res.box20Count = box20Count;
						res.box40Count = box40Count;
						res.box40hqCount = box40hqCount;
						res.box45Count = box45Count;
						// 更改CBM单元格
						rec.set("boxCbm", cbm);

						rightChange("boxCbm", cbm);
						rightChange("boxObHInch", boxObHInch);
						rightChange("boxCuft", (cbm * 35.315).toFixed("3"));
						rightChange("box20Count", box20Count);
						rightChange("box40Count", box40Count);
						rightChange("box40hqCount", box40hqCount);
						rightChange("box45Count", box45Count);
						// 箱数
						var containerCount = rec.data.containerCount;
						// 总体积
						var totalCbm = cbm * containerCount;
						rec.set("totalCbm", totalCbm);
						res.totalCbm = totalCbm;

						// 计算包材价格
						DWREngine.setAsync(false);
						cotOrderService.calPriceAll(rdm, function(def) {
									if (def != null) {
										res.boxPbPrice = def[0];
										res.boxIbPrice = def[1];
										res.boxMbPrice = def[2];
										res.boxObPrice = def[3];
										res.packingPrice = def[4];
										if (def[5] != -1) {
											res.priceFac = def[5];
											rec.set("priceFac", def[5]);
										}
									}
								});
						DWREngine.setAsync(true);
						// 将对象储存到后台map中
						cotOrderService.setOrderMap(rdm, res, function(res) {
								});
					}
				});
		DWREngine.setAsync(true);
	}

	// cbm的更改事件,计算出装箱数
	function changeCbm(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm == null || rdm == "") {
			return;
		}
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
			if (res != null) {
				var boxObCount = rec.data.boxObCount;// 外装数

				var con20 = $('con20').value;
				var con40H = $('con40H').value;
				var con40 = $('con40').value;
				var con45 = $('con45').value;
				if (boxObCount == '' || isNaN(boxObCount)) {
					boxObCount = 0;
				}
				var box20Count = 0;
				var box40Count = 0;
				var box40hqCount = 0;
				var box45Count = 0;
				if (newVal != '' && newVal != 0) {
					box20Count = Math.floor(con20 / newVal) * boxObCount;
					box40Count = Math.floor(con40 / newVal) * boxObCount;
					box40hqCount = Math.floor(con40H / newVal) * boxObCount;
					box45Count = Math.floor(con45 / newVal) * boxObCount;

					res.box20Count = box20Count;
					res.box40Count = box40Count;
					res.box40hqCount = box40hqCount;
					res.box45Count = box45Count;
				} else {
					res.box20Count = 0;
					res.box40Count = 0;
					res.box40hqCount = 0;
					res.box45Count = 0;
				}
				var containerCount = rec.data.containerCount;
				// 重新计算总体积
				$('totalCbmLab').innerText = (parseFloat($('totalCbmLab').innerText)
						- rec.data.totalCbm + containerCount * newVal)
						.toFixed(cbmNum);
				rec.set("totalCbm", (containerCount * newVal).toFixed(cbmNum));

				res.boxCbm = newVal;
				res.boxCuft = (newVal * 35.315).toFixed("3");
				rightChange("boxCuft", res.boxCuft);
				rightChange("boxCbm", newVal);
				rightChange("box20Count", box20Count);
				rightChange("box40Count", box40Count);
				rightChange("box40hqCount", box40hqCount);
				rightChange("box45Count", box45Count);
				res.totalCbm = containerCount * newVal;

				// 将对象储存到后台map中
				cotOrderService.setOrderMap(rdm, res, function(res) {
						});
			}
		});
		DWREngine.setAsync(true);
	}

	// 毛重的更改事件,计算出总毛重
	function changeGross(newVal) {
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm == null || rdm == "") {
			return;
		}
		DWREngine.setAsync(false);
		cotOrderService.getOrderMapValue(rdm, function(res) {
			if (res != null) {
				var containerCount = rec.data.containerCount;
				var totalGross = newVal * containerCount;
				// 重新计算总毛重
				$('totalGrossLab').innerText = (parseFloat($('totalGrossLab').innerText)
						- rec.data.totalGrossWeigth + totalGross).toFixed('3');
				// 计算总价
				rec.set("totalGrossWeigth", totalGross);
				res.totalGrossWeigth = totalGross;
				res.boxGrossWeigth = newVal;
				rightChange("boxGrossWeigth", newVal);

				// 将对象储存到后台map中
				cotOrderService.setOrderMap(rdm, res, function(res) {
						});
			}
		});
		DWREngine.setAsync(true);
	}

	// 下载多张图片.并且压缩.zip
	function downPics() {
		var temp = "";
		var arr = sm.getSelections();
		if (arr.length == 0) {
			Ext.MessageBox.alert('Message', 'Please select a record!');
			return;
		}
		Ext.each(arr, function(record) {
					temp += record.get("rdm") + ",";
				})

		var orderNo = $('orderNo').value;
		var type = $('picType').value;
		var url = "./downPics.action?priceNo=" + encodeURIComponent(orderNo)
				+ "&tp=order&rdms=" + temp + "&type=" + type;
		downRpt(url);
	}

	// 盘点机添加到表格
	this.insertAgain = function(res) {
		if (res.currencyId != $('currencyId').value) {
			DWREngine.setAsync(false);
			// 重新换算价格
			queryService.updatePrice(res.orderPrice, res.currencyId,
					$('currencyId').value, function(newPri) {
						res.orderPrice = newPri.toFixed(deNum);
						res.currencyId = $('currencyId').value;
					});
			DWREngine.setAsync(true);
		}
		var rdm = getRandom();
		res.rdm = rdm;
		DWREngine.setAsync(false);
		// 将添加的样品对象储存到后台map中
		cotOrderService.setOrderMap(rdm, res, function(ak) {
				});
		DWREngine.setAsync(true);
		setObjToGrid(res);
	}

	// 不存在样品档案货号直接添加到明细中
	this.noEleAsNew = function(pareEleId) {
		var rdm = getRandom();
		// ds.remove(editRec);// 删除行
		// var rec = editRec;
		var obj = new Object();
		// 设置序列号
		obj.eleId = pareEleId.toUpperCase();
		obj.orderPrice = 0;
		obj.type = 'none';
		obj.srcId = 0;
		obj.eleFlag = 0;
		obj.boxObCount = 1;
		obj.priceFac = 0;
		obj.priceFacUint = facPriceUnit;
		obj.rdm = rdm;

		// rec.set('eleId', pareEleId.toUpperCase());
		// rec.set('orderPrice', 0);
		// rec.set('type', 'none');
		// rec.set('srcId', 0);
		// rec.set('eleFlag', 0);
		// rec.set('boxObCount', 1);
		// rec.set('priceFac', 0);
		// rec.set('priceFacUint', facPriceUnit);
		// rec.set('rdm', rdm);
		setObjToGrid(obj);
		// 将添加的样品对象储存到后台map中
		cotOrderService.setOrderMap(rdm, obj, function(res) {
				});
		// 把焦点放在新增空白行
		// addNewGrid();
	}

	// 根据客号查找货号(如果货号有值不做处理.)
	function insertByCustNo(custNo) {
		var currencyId = $('currencyId').value;
		// 根据客号查找货号(取最近报价时间)
		cotOrderService.findEleByCustNo(custNo, $('custId').value,
				$('clauseTypeId').value, $('orderTime').value, function(rtn) {
					if (rtn != null) {
						var obj = rtn[1];
						var rdm = getRandom();
						if (rtn[0] == 1) {
							obj.orderPrice = obj.pricePrice;
							obj.type = 'price';
						} else if (rtn[0] == 2) {
							obj.type = 'order';
						} else if (rtn[0] == 3) {
							obj.orderPrice = obj.priceOut;
							obj.currencyId = obj.priceOutUint;
							obj.type = 'given';
						}
						obj.srcId = obj.id;
						obj.rdm = rdm;
						obj.id = null;
						var havePrice = $('havePrice').value;
						// 取对外报价
						if (havePrice == 0) {
							// 判断该产品货号是否存在,有存在的话转成报价明细
							cotOrderService.changeEleToOrderDetail(obj.eleId,
									function(res) {
										if (res != null) {
											res.type = 'ele';
											res.srcId = res.id;
											res.id = null;
											res.custNo = custNo;
											// 重新换算价格(币种不同时)
											queryService.updatePrice(
													res.priceOut,
													res.priceOutUint,
													currencyId,
													function(newPri) {
														res.orderPrice = newPri
																.toFixed(deNum);
														res.currencyId = currencyId;
														res.rdm = rdm;
														ds.remove(editRec);// 删除行
														insertToGrid(res, false);
														addNewGrid();
													});
										} else {
											// 重新换算价格(币种不同时)
											queryService.updatePrice(
													obj.orderPrice,
													obj.currencyId, currencyId,
													function(newPri) {
														obj.orderPrice = newPri
																.toFixed(deNum);
														obj.currencyId = currencyId;
														ds.remove(editRec);// 删除行
														insertToGrid(obj, false);
														addNewGrid();
													});
										}
									});

						}
						// 按价格条款计算
						if (havePrice == 1) {
							ds.remove(editRec);// 删除行
							obj.currencyId = currencyId;
							insertToGrid(obj, true);
							addNewGrid();
						}
						// 取最近一次报价
						if (havePrice == 2) {
							// 重新换算价格(币种不同时)
							queryService.updatePrice(obj.orderPrice,
									obj.currencyId, currencyId,
									function(newPri) {
										obj.orderPrice = newPri.toFixed(deNum);
										obj.currencyId = currencyId;
										ds.remove(editRec);// 删除行
										insertToGrid(obj, false);
										addNewGrid();
									});
						}
					}
				});
	}

	// 供按样品模版添加的页面调用
	this.newEleAdd = function(obj) {
		var rdm = getRandom();
		ds.remove(editRec);// 删除行
		// 设置序列号
		obj.type = 'ele';
		obj.srcId = obj.id;
		obj.rdm = rdm;
		obj.id = null;
		// 重新换算价格
		DWREngine.setAsync(false);
		queryService.updatePrice(obj.priceOut, obj.priceOutUint,
				$('currencyId').value, function(res) {
					// 报价取对外报价
					obj.orderPrice = res.toFixed(deNum);
					setObjToGrid(obj);
				});
		DWREngine.setAsync(true);
		// 转化下时间
		var date = new Date(obj.eleAddTime);
		var date2 = new Date(obj.eleProTime);
		obj.eleAddTime = date;
		obj.eleProTime = date2;
		// 将添加的样品对象储存到后台map中
		cotOrderService.setOrderMap(rdm, obj, function(res) {
				});
		// 把焦点放在新增空白行
		addNewGrid();
	}

	// 按模板
	var addWithMol = function() {
		var model = $('modelEle').value;
		if (model == '') {
			return;
		} else {
			DWREngine.setAsync(false);
			mask();
			DWREngine.setAsync(true);
			cotOrderService.saveAs(model, $('pId').value, function(res) {
						if (res == true) {
							modlPanel.hide();
							Ext.MessageBox.alert('Message',
									"Save as new orders successfully!");
						} else {
							Ext.MessageBox.alert('Message',
									"Order already exists, please re-enter!");
							$('modelEle').select();
						}
						unmask();
					});
		}
	}

	// 显示模板面板
	var modlPanel;
	function showModel(item, pressed) {
		if ($('importDiv') == null) {
			// window默认在z-index为9000
			Ext.DomHelper.append(document.body, {
				html : '<div id="importDiv" style="position:absolute;z-index:9500;"></div>'
			}, true);
		}
		if (modlPanel == null) {
			modlPanel = new Ext.form.FormPanel({
				labelWidth : 60,
				padding : "5px",
				height : 80,
				width : 320,
				layout : 'hbox',
				frame : true,
				title : "Save as",
				labelAlign : "right",
				layoutConfig : {
					padding : '5',
					align : 'middle'
				},
				tools : [{
							id : "close",
							handler : function(event, toolEl, p) {
								p.hide();
							}
						}],
				defaults : {
					margins : '0 5 0 0'
				},
				items : [{
					xtype : "panel",
					layout : "column",
					flex : 3,
					items : [{
						xtype : "panel",
						layout : "form",
						columnWidth : 1,
						items : [{
							xtype : "textfield",
							fieldLabel : "W&C P/I",
							anchor : "100%",
							id : "modelEle",
							blankText : "Please enter W&C P/I!",
							name : "modelEle",
							maxLength : 100,
							allowBlank : false,
							readOnly:true,
							listeners : {
								"render" : function(obj) {
									var tip = new Ext.ToolTip({
										target : obj.getEl(),
										anchor : 'top',
										maxWidth : 160,
										minWidth : 160,
										html : 'Click the right button to automatically generate the W&C P/I!'
									});
								}
							}
						}]
					}, {
						xtype : "button",
						width : 20,
						text : "",
						cls : "SYSOP_ADD",
						iconCls : "cal",
						handler : getNewOrderNo,
						listeners : {
							"render" : function(obj) {
								var tip = new Ext.ToolTip({
									target : obj.getEl(),
									anchor : 'top',
									maxWidth : 160,
									minWidth : 160,
									html : 'Depending on the configuration automatically generated W&C P/I!'
								});
							}
						}
					}]
				}, {
					xtype : "button",
					flex : 1,
					text : "save",
					handler : addWithMol
				}]
			});
			var tag = item.getEl();
			var left = Ext.Element.fly(tag).getX();
			var top = Ext.Element.fly(tag).getY();
			Ext.Element.fly("importDiv").setLeftTop(left, top - 80);
			modlPanel.render("importDiv");
			$('modelEle').focus();
		} else {
			if (!modlPanel.isVisible()) {
				modlPanel.show();
			} else {
				modlPanel.hide();
			}
		}
	};

	// 根据折扣类型计算货款金额和实际金额,newVal,oldVal为订单明细新旧总金额
	function sumMage(oldVal, newVal) {
		// 判断折扣类型
		var temp = Number(newVal);
		var temp2 = Number(oldVal);
		if (zheBox.getValue() == 2) {
			// 折扣率
			if ($('zheNum').value != '') {
				var zheNum = Number($('zheNum').value).mul(0.01);
				temp = temp.mul(zheNum);
				temp2 = temp2.mul(zheNum);
			}
		}
		$('totalLab').innerText = (parseFloat($('totalLab').innerText) - temp2 + temp)
				.toFixed(deNum);
		// 重新计算实际金额
		$('realLab').innerText = (parseFloat($('realLab').innerText) - temp2 + temp)
				.toFixed(deNum);
	}

	// 数量值改变事件(改变箱数,金额,总cbm)
	function countNum(newVal, oldVal) {
		if (newVal == '') {
			newVal = 0;
		}
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			cotOrderService.getOrderMapValue(rdm, function(res) {
				if (res != null) {
					var tip = 0;
					// 外箱数
					var boxObCount = rec.data.boxObCount;
					// 单体积
					var boxCbm = rec.data.boxCbm;
					// 单毛重
					var boxGrossWeigth = rec.data.boxGrossWeigth;
					var cot = 0;
					if (boxObCount != null && boxObCount != ''
							&& boxObCount != 0) {
						// 计算箱数
						if (newVal % boxObCount != 0) {
							cot = parseInt(newVal / boxObCount) + 1;
							// 如果没满箱是否重算数量
							var orderTip = $('orderTip').value;
							if (orderTip == 1) {
								var tp = (parseInt(newVal / boxObCount) + 1)
										* boxObCount;
								rec.set('boxCount', tp);
								newVal = tp;
								tip = 1;
							} else {
								tip = 2;
							}
						} else {
							cot = newVal / boxObCount;
						}
					}
					rec.set("containerCount", cot);
					// 单价
					var orderPrice = rec.data.orderPrice;
					// 总价
					var totalMoney = Number(newVal).mul(orderPrice);
					// 总体积
					var totalCbm = Number(boxCbm).mul(cot);
					// 总毛重
					var totalGross = Number(boxGrossWeigth).mul(cot);

					// 重新计算货款金额
					sumMage(rec.data.totalMoney, totalMoney);
					// 重新计算总体积
					if (!rec.data.totalCbm) {
						rec.data.totalCbm = 0;
					}
					$('totalCbmLab').innerText = (parseFloat($('totalCbmLab').innerText)
							- rec.data.totalCbm + totalCbm).toFixed(cbmNum);
					// 重新计算总毛重
					if (!rec.data.totalGrossWeigth) {
						rec.data.totalGrossWeigth = 0;
					}
					$('totalGrossLab').innerText = (parseFloat($('totalGrossLab').innerText)
							- rec.data.totalGrossWeigth + totalGross)
							.toFixed('3');

					// 计算总价
					rec.set("totalMoney", totalMoney.toFixed('2'));
					rec.set("totalCbm", totalCbm.toFixed(cbmNum));
					rec.set("totalGrossWeigth", totalGross);

					res.containerCount = cot;
					res.totalCbm = totalCbm;
					res.totalMoney = totalMoney;
					res.boxCount = rec.data.boxCount;
					// 将对象储存到后台map中
					cotOrderService.setOrderMap(rdm, res, function(res) {
							});
					if (tip == 1) {
						var tip = new Ext.ToolTip({
							title : 'Message',
							anchor : 'top',
							html : 'Order Details section is not filled with a box, is automatically adjusted according to the number of service configuration！'
						});
						tip.showAt([ckX, ckY + 30]);
					}
					if (tip == 2) {
						var tip = new Ext.ToolTip({
							title : 'Message',
							anchor : 'top',
							html : 'Order Details section is not filled with a box！'
						});
						tip.showAt([ckX, ckY + 30]);
					}
				}
			});
		}
	}

	// 箱数值改变事件(改变数量,金额,总cbm)
	function containNum(newVal, oldVal) {
		if (newVal == '') {
			newVal = 0;
		}
		var rec = editRec;
		var rdm = rec.data.rdm;
		if (rdm != null && rdm != "") {
			cotOrderService.getOrderMapValue(rdm, function(res) {
				if (res != null) {
					// 外箱数
					var boxObCount = rec.data.boxObCount;;
					var boxCbm = rec.data.boxCbm;
					// 单价
					var orderPrice = rec.data.orderPrice;

					var oldBoxCount = rec.data.boxCount;
					var newBoxCount = newVal * boxObCount;
					// // 判断该货号是否导完出货标识为1,这时如果增加数量,将标识改为0;
					// if (newBoxCount > oldBoxCount) {
					// if (res.unBoxSend == 1) {
					// res.unBoxSend = 0;
					// }
					// res.unBoxCount = res.unBoxCount
					// + (newBoxCount - oldBoxCount);
					// }
					// var out = oldBoxCount - res.unBoxCount;
					// // 如果减小数量
					// if (newBoxCount < oldBoxCount) {
					// if (res.unBoxSend == 1) {
					// rec.set('containerCount', oldVal);
					// var tip = new Ext.ToolTip({
					// title : 'Message',
					// anchor : 'left',
					// html : 'The record has been shipped<font color=red>'
					// + out
					// + '</font>QTY,Orders can not be less than the number of
					// shipments!'
					// });
					// tip.showAt([ckX, ckY]);
					// return;
					// } else {
					// if (newBoxCount >= out) {
					// res.unBoxCount = res.unBoxCount
					// + (newBoxCount - oldBoxCount);
					// if (res.unBoxCount == 0) {
					// res.unBoxSend = 1;
					// }
					// } else {
					// rec.set('containerCount', oldVal);
					// var tip = new Ext.ToolTip({
					// title : 'Message',
					// anchor : 'left',
					// html : 'The record has been shipped<font color=red>'
					// + out
					// + '</font>QTY,Orders can not be less than the number of
					// shipments!'
					// });
					// tip.showAt([ckX, ckY]);
					// return;
					// }
					// }
					// }

					// 计算数量
					rec.set("boxCount", newBoxCount);
					// 计算总体积
					var newCbm = Number(boxCbm).mul(newVal);
					if (!rec.data.boxCount) {
						rec.data.boxCount = 0;
					}
					// 数量
					var boxCount = rec.data.boxCount;

					// 总价
					var totalMoney = boxCount * orderPrice;

					// 单毛重
					var boxGrossWeigth = rec.data.boxGrossWeigth;
					// 总毛重
					var totalGross = Number(boxGrossWeigth).mul(newVal);

					// 重新计算总价
					sumMage(rec.data.totalMoney, totalMoney);
					// 重新计算总体积
					$('totalCbmLab').innerText = (parseFloat($('totalCbmLab').innerText)
							- rec.data.totalCbm + newCbm).toFixed(cbmNum);
					// 重新计算总毛重
					$('totalGrossLab').innerText = (parseFloat($('totalGrossLab').innerText)
							- rec.data.totalGrossWeigth + totalGross)
							.toFixed('3');
					rec.set("totalCbm", newCbm.toFixed(cbmNum));
					// 计算总价
					rec.set("totalMoney", totalMoney.toFixed(deNum));
					rec.set("totalGrossWeigth", totalGross);

					res.containerCount = newVal;
					res.boxCount = boxCount;
					res.totalCbm = newCbm;
					res.totalMoney = totalMoney;

					// 将对象储存到后台map中
					cotOrderService.setOrderMap(rdm, res, function(res) {
							});
				}
			});
		}

	}

	// 样品同步到报价
	var chooseWin;
	function showTongDiv() {
		var isPopedom = getPopedomByOpType("cotorder.do", "ORDERTOSAMPLE");
		if (isPopedom == 0) {
			Ext.MessageBox
					.alert('Message', "Sorry, you do not have Authority!");
			return;
		}
		var ids = getIds();
		if (ids.length == 0) {
			Ext.MessageBox.alert("Message", "Please select records");
			return;
		}
		chooseWin = new TongChooseWin({
					flag : 0
				});
		chooseWin.show();
	}
	// 报价同步到样品
	function showTongPriceDiv() {
		var isPopedom = getPopedomByOpType("cotorder.do", "SAMPLETOORDER");
		if (isPopedom == 0) {
			Ext.MessageBox
					.alert('Message', "Sorry, you do not have Authority!");
			return;
		}
		var ids = getIds();
		if (ids.length == 0) {
			Ext.MessageBox.alert("Message", "Please select records");
			return;
		}
		chooseWin = new TongChooseWin({
					flag : 1
				});
		chooseWin.show();
	}

	// 隐藏同步选择层
	this.hideRightMenu = function() {
		chooseWin.close();
	}

	// 更新到订单明细
	this.updateToPrice = function(eleStr, boxStr, otherStr, isPic) {
		var idsAry = new Array();
		var rdmAry = new Array();
		var cord = sm.getSelections();
		Ext.each(cord, function(item) {
					idsAry.push(item.data.eleId);
					rdmAry.push(item.data.rdm);
				});

		if (idsAry.length == 0) {
			Ext.MessageBox.alert('Message',
					'Pls. select the records need to be synchronized!');
			return;
		}
		chooseWin.close();
		DWREngine.setAsync(false);
		mask();
		DWREngine.setAsync(true);
		cotOrderService.updateEleToDetail(idsAry, rdmAry, eleStr, boxStr,
				otherStr, isPic, function(res) {
					if (res.length > 0) {
						for (var i = 0; i < res.length; i++) {
							var detail = res[i];
							Ext.each(cord, function(item) {
										var rdm = item.data.rdm;
										if (rdm == detail.rdm) {
											tongEleToPrice(detail, item,
													eleStr, boxStr, otherStr);
											return false;
										}
									});
						}
					}
					unmask();
					Ext.MessageBox.alert('Message',
							'Synchronization successful！');
				});

	}

	// flag为false时是新增
	function tongEleToPrice(detail, item, eleStr, boxStr, otherStr) {
		var tr = item.data;
		if (eleStr != null && eleStr != '') {
			var eleAry = eleStr.split(",");
			for (var i = 0; i < eleAry.length - 1; i++) {
				var ele = eleAry[i];
				if (ele == 'priceOut') {
					// 重新换算价格
					DWREngine.setAsync(false);
					queryService.updatePrice(detail.priceOut,
							detail.priceOutUint, $('currencyId').value,
							function(newPri) {
								item.set('orderPrice', newPri.toFixed(deNum));
							});
					DWREngine.setAsync(true);
				} else {
					var obj = eval("detail." + ele);
					var temp = eval("tr." + eleAry[i]);
					if ((obj == null && temp == 0) || obj == temp)
						continue;
					item.set(eleAry[i], obj);
				}
			}
		}
		if (boxStr != null && boxStr != '') {
			var eleAry = boxStr.split(",");
			for (var i = 0; i < eleAry.length - 1; i++) {
				var ele = eleAry[i];
				var obj = eval("detail." + ele);
				var temp = eval("tr." + eleAry[i]);
				if ((obj == null && temp == 0) || obj == temp)
					continue;
				item.set(eleAry[i], obj);
				if (ele == 'boxNetWeigth') {
					item.set('boxGrossWeigth', detail.boxGrossWeigth);
				}
			}
		}
		if (otherStr != null && otherStr != '') {
			var eleAry = otherStr.split(",");
			for (var i = 0; i < eleAry.length - 1; i++) {
				var ele = eleAry[i];
				var obj = eval("detail." + ele);
				var temp = eval("tr." + eleAry[i]);
				if ((obj == null && temp == 0) || obj == temp)
					continue;
				item.set(eleAry[i], obj);
			}
		}

		item.set('boxCount', eval("detail.boxCount"));
		item.set('totalMoney', eval("detail.totalMoney"));

	}

	// 更新到样品表
	this.updateToEle = function(eleStr, boxStr, otherStr, isPic) {
		var mapEle = new Map();
		var cord = sm.getSelections();
		Ext.each(cord, function(item) {
					if (item.data.eleId.trim() != '') {
						// 判断货号是否重复,重复取后一条去覆盖
						mapEle.put(item.data.eleId, item.data.rdm);
					}
				});

		if (mapEle.getKeys().length == 0) {
			Ext.MessageBox
					.alert('Message',
							'Pls. select the records you want to update to the sample!');
			return;
		}
		chooseWin.close();
		var key = mapEle.getKeys();
		DWREngine.setAsync(false);
		mask();
		DWREngine.setAsync(true);
		cotOrderService.findIsExistInEle(key, function(res) {
			var sameTemp = '';
			var same = res.same;
			// 获得存在样品档案的货号的随机数
			var sameVal = new Array();
			for (var i = 0; i < same.length; i++) {
				sameTemp += same[i] + ",";
				sameVal.push(mapEle.get(same[i]));
			}
			// 获得不存在样品档案的货号的随机数
			var dis = res.dis;
			var disVal = new Array();
			for (var i = 0; i < dis.length; i++) {
				disVal.push(mapEle.get(dis[i]));
			}
			if (same.length != 0) {
				Ext.MessageBox.confirm('Message', 'Item already exists'
								+ sameTemp + "Overwrite record?",
						function(btn) {
							if (btn == 'yes') {
								cotOrderService.updateToEle(same, sameVal, dis,
										disVal, eleStr, boxStr, otherStr,
										isPic, function(res) {
											Ext.MessageBox.alert('Message',
													'Synchronization success!');
										});
							} else {
								if (dis.length != 0) {
									cotOrderService.updateToEle(null, null,
											dis, disVal, eleStr, boxStr,
											otherStr, isPic, function(res) {
												Ext.MessageBox
														.alert('Message',
																'Synchronization success!');
											});
								}
							}
						});
			} else {
				if (dis.length != 0) {
					cotOrderService.updateToEle(null, null, dis, disVal,
							eleStr, boxStr, otherStr, isPic, function(res) {
								Ext.MessageBox.alert('Message',
										'Synchronization success!');
							});
				}
			}
			unmask();
		});
	}

	// 当配件或成本改变后修改对应的价格
	function updatePriceFacWhenElePriceChange() {
		var isHId = sm.getSelected().get("id");
		var rdm = sm.getSelected().get("rdm");
		var ck = sm.getSelected().get("checkFlag");
		var liRun = sm.getSelected().get("liRun");
		// 将计算单价的参数组成一个map
		var mapPrice = {};
		if (ck == null || ck == 0 || ck == false) {
			mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
			mapPrice.currencyId = $('currencyId').value;// 币种
			mapPrice.orderProfit = liRun;// 利润率
			mapPrice.orderFob = $('orderFob').value;// FOB
			mapPrice.orderRate = $('orderRate').value;// 汇率
			mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
			mapPrice.insureRate = $('insureRate').value;// 保险费率
			mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
			mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
		} else {
			mapPrice = null;
		}
		// 获取修改后的价格
		DWREngine.setAsync(false);
		cotOrderService.updatePriceFac(isHId, rdm, mapPrice, function(detail) {
					if (detail != null) {
						sm.getSelected().set("orderPrice", detail.orderPrice);
						sm.getSelected().set("priceFac", detail.priceFac);
					}
				});
		DWREngine.setAsync(true);
	}

	// 成批指定订单明细的厂家
	function updateFacBatch() {
		var bacFactoryId = batFacBox.getValue();
		var recs = sm.getSelections();
		Ext.each(recs, function(item) {
					item.set('factoryId', bacFactoryId);
					cotOrderService.updateMapValueByEleId(item.data.rdm,
							'factoryId', bacFactoryId, function(res) {
							});
				});
	}

	// 将合并后的子货号添加到表格
	this.insertChildSelect = function(ary) {
		var noPrice = $('noPrice').value;
		var havePrice = $('havePrice').value;
		var currencyId = $('currencyId').value;
		var clauseId = $('clauseTypeId').value;
		var orderTime = $('orderTime').value;
		// 判断该产品是否对该用户报价过
		cotOrderService.findIsExistDetail(ary[0], custBox.getValue(), clauseId,
				orderTime, function(rtn) {
					// 取得随机数
					var rdm = getRandom();
					if (rtn != null) {
						var result = rtn[1];
						if (rtn[0] == 1) {
							result.type = 'price';
							result.orderPrice = result.pricePrice;
						} else if (rtn[0] == 2) {
							result.type = 'order';
						} else if (rtn[0] == 3) {
							result.orderPrice = result.priceOut;
							result.currencyId = result.priceOutUint;
							result.type = 'given';
						}
						result.srcId = result.id;
						result.id = null;
						result.rdm = rdm;
						if (havePrice == 0) {
							result.eleId = ary[0];
							result.orderPrice = ary[1];
							result.eleSizeDesc = ary[2];
							result.eleInchDesc = ary[3];
							result.boxCbm = ary[4];
							result.boxGrossWeigth = ary[5];
							result.boxNetWeigth = ary[6];
							result.taoUnit = ary[7];
							result.priceFac = ary[8];
							result.eleName = ary[9];
							result.boxIbCount = ary[10];
							result.boxMbCount = ary[11];
							result.boxObCount = ary[12];
							result.boxObL = ary[13];
							result.boxObW = ary[14];
							result.boxObH = ary[15];
							result.eleUnit = ary[16];
							result.eleNameEn = ary[17];
							result.priceFacUint = curBox.getValue();
							insertToGrid(result, false);
						}
						// 按价格条款计算
						if (havePrice == 1) {
							insertToGrid(result, true);
						}
						// 取最近一次报价
						if (havePrice == 2) {
							// 重新换算价格(币种不同时)
							queryService.updatePrice(result.orderPrice,
									result.currencyId, currencyId, function(
											newPri) {
										result.orderPrice = newPri
												.toFixed(deNum);
										result.currencyId = currencyId;
										insertToGrid(result, false);
									});
						}
					} else {
						var priceDetail = new CotOrderDetail();
						priceDetail.eleId = ary[0];
						priceDetail.orderPrice = ary[1];
						priceDetail.eleSizeDesc = ary[2];
						priceDetail.eleInchDesc = ary[3];
						priceDetail.boxCbm = ary[4];
						priceDetail.boxGrossWeigth = ary[5];
						priceDetail.boxNetWeigth = ary[6];
						priceDetail.taoUnit = ary[7];
						priceDetail.priceFac = ary[8];
						priceDetail.eleName = ary[9];
						priceDetail.boxIbCount = ary[10];
						priceDetail.boxMbCount = ary[11];
						priceDetail.boxObCount = ary[12];
						priceDetail.boxObL = ary[13];
						priceDetail.boxObW = ary[14];
						priceDetail.boxObH = ary[15];
						priceDetail.eleUnit = ary[16];
						priceDetail.eleNameEn = ary[17];
						priceDetail.priceFacUint = curBox.getValue();
						var rdm = getRandom();
						priceDetail.rdm = rdm;
						priceDetail.type = 'none';
						priceDetail.srcId = 0;
						if (noPrice == 0) {
							insertToGrid(priceDetail, false);
						}
						if (noPrice == 1) {
							insertToGrid(priceDetail, true);
						}
					}
				});
	}

	// 比对柜最大装箱重量
	function sumContainCount() {
		var rdm = $('rdm').value;
		if (rdm == '') {
			return;
		}
		var gross = $('boxGrossWeigth').value;
		if (gross == '' || isNaN(gross)) {
			Ext.MessageBox.show({
						title : 'Message',
						msg : 'Pls. enter the gross weight (only number)！',
						height : 300,
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.WARNING,
						fn : function() {
							$('boxGrossWeigth').focus();
						}
					});
		} else {
			queryService.getContainerWeigh(function(res) {
						var boxObCount = $('boxObCount').value;
						if (isNaN(boxObCount)) {
							boxObCount = 0;
						}
						var max20 = parseInt((res[0] / gross) * boxObCount);
						var max40 = parseInt((res[1] / gross) * boxObCount);
						var max40hq = parseInt((res[2] / gross) * boxObCount);
						var max45 = parseInt((res[3] / gross) * boxObCount);

						if ($('box20Count').value != ''
								&& $('box20Count').value > max20) {
							$('box20Count').value = max20;
						}
						if ($('box40Count').value != ''
								&& $('box40Count').value > max40) {
							$('box40Count').value = max40;
						}
						if ($('box40hqCount').value != ''
								&& $('box40hqCount').value > max40hq) {
							$('box40hqCount').value = max40hq;
						}
						if ($('box45Count').value != ''
								&& $('box45Count').value > max45) {
							$('box45Count').value = max45;
						}
						updateMapValue(rdm, 'box20Count', $('box20Count').value);
						updateMapValue(rdm, 'box40Count', $('box40Count').value);
						updateMapValue(rdm, 'box40hqCount',
								$('box40hqCount').value);
						updateMapValue(rdm, 'box45Count', $('box45Count').value);
					});
		}
	}

	// 通过cbm和外箱数计算装箱数,获得20/40/40HQ/45的柜体积(默认24/54/68/86)
	function sumContainCountCBM() {
		var rdm = $('rdm').value;
		if (rdm == '') {
			return;
		}
		var cbm = $('boxCbm').value;
		if (cbm == '' || isNaN(cbm)) {
			Ext.MessageBox.show({
						title : 'Message',
						msg : 'Pls. enter the CBM (only number)！',
						height : 300,
						buttons : Ext.MessageBox.OK,
						icon : Ext.MessageBox.WARNING,
						fn : function() {
							$('boxCbm').focus();
						}
					});
		} else {
			queryService.getContainerCube(function(res) {
						var boxObCount = $('boxObCount').value;
						if (isNaN(boxObCount)) {
							boxObCount = 0;
						}
						var max20 = parseInt(res[0] / cbm) * boxObCount;
						var max40 = parseInt(res[1] / cbm) * boxObCount;
						var max40hq = parseInt(res[2] / cbm) * boxObCount;
						var max45 = parseInt(res[3] / cbm) * boxObCount;

						if ($('box20Count').value != ''
								&& $('box20Count').value > max20) {
							$('box20Count').value = max20;
						}
						if ($('box40Count').value != ''
								&& $('box40Count').value > max40) {
							$('box40Count').value = max40;
						}
						if ($('box40hqCount').value != ''
								&& $('box40hqCount').value > max40hq) {
							$('box40hqCount').value = max40hq;
						}
						if ($('box45Count').value != ''
								&& $('box45Count').value > max45) {
							$('box45Count').value = max45;
						}
						updateMapValue(rdm, 'box20Count', $('box20Count').value);
						updateMapValue(rdm, 'box40Count', $('box40Count').value);
						updateMapValue(rdm, 'box40hqCount',
								$('box40hqCount').value);
						updateMapValue(rdm, 'box45Count', $('box45Count').value);
					});
		}
	}

	// 通过单重计算净重/毛重
	function calWeight(txt, newVal, oldVal) {
		var rec = null;
		var rdm = $('rdm').value;
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		if (index != -1) {
			rec = ds.getAt(index);
		} else {
			return;
		}
		if (rdm != null && rdm != "") {
			var boxObCount = rec.data.boxObCount;
			if (boxObCount == "") {
				boxObCount = 0;
			}
			cotElementsService.getDefaultList(function(res) {
						var jin = newVal * boxObCount / 1000;
						$('boxNetWeigth').value = jin.toFixed(3);
						var boxGrossWeigth = 0;
						if (res.length != 0) {
							if (res[0].grossNum != null) {
								var temp = jin + res[0].grossNum;
								boxGrossWeigth = temp.toFixed(3);
							}
						} else {
							boxGrossWeigth = jin.toFixed(3);
						}
						$('boxGrossWeigth').value = boxGrossWeigth;
						rec.set("boxNetWeigth", jin.toFixed(3));
						rec.set("boxGrossWeigth", boxGrossWeigth);
						updateMapValue(rdm, "boxWeigth", newVal);
						updateMapValue(rdm, "boxNetWeigth", jin.toFixed(3));
						updateMapValue(rdm, "boxGrossWeigth", boxGrossWeigth);
					});

		}
	}

	// 通过cbm计算cuft
	function calCuftCube(txt, newVal, oldVal) {
		var rec = null;
		var rdm = $('rdm').value;
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		if (index != -1) {
			rec = ds.getAt(index);
		} else {
			return;
		}
		var boxObCount = rec.data.boxObCount;
		if (rdm != null && rdm != "") {
			if (isNaN(newVal) || newVal == "") {
				newVal = 0;
				$('boxCuft').value = 0;
			} else {
				var s = newVal * 35.315;
				$('boxCuft').value = s.toFixed(3);
			}
			updateMapValue(rdm, "boxCbm", newVal);
			updateMapValue(rdm, "boxCuft", $('boxCuft').value);

			if (boxObCount == "") {
				boxObCount = 0;
			}
			if (newVal == 0) {
				newVal = 0.0001;
			}
			queryService.getContainerCube(function(res) {
						$('box20Count').value = parseInt(res[0] / newVal)
								* boxObCount;
						$('box40Count').value = parseInt(res[1] / newVal)
								* boxObCount;
						$('box40hqCount').value = parseInt(res[2] / newVal)
								* boxObCount;
						$('box45Count').value = parseInt(res[3] / newVal)
								* boxObCount;
						updateMapValue(rdm, "box20Count", $('box20Count').value);
						updateMapValue(rdm, "box40Count", $('box40Count').value);
						updateMapValue(rdm, "box40hqCount",
								$('box40hqCount').value);
						updateMapValue(rdm, "box45Count", $('box45Count').value);
					});

		}
	}

	// 通过cuft计算cbm
	function calCbmCube(txt, newVal, oldVal) {
		var rec = null;
		var rdm = $('rdm').value;
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		if (index != -1) {
			rec = ds.getAt(index);
		} else {
			return;
		}
		var boxObCount = rec.data.boxObCount;
		if (rdm != null && rdm != "") {
			if (isNaN(newVal) || newVal == "") {
				newVal = 0;
				$('boxCbm').value = 0;
			} else {
				var s = newVal / 35.315;
				$('boxCbm').value = s.toFixed(cbmNum);
			}
			var cbm = $('boxCbm').value;
			rec.set('boxCbm', cbm.toFixed(cbmNum));
			updateMapValue(rdm, "boxCbm", cbm);
			updateMapValue(rdm, "boxCuft", newVal);

			if (boxObCount == "") {
				boxObCount = 0;
			}
			if (cbm == 0) {
				cbm = 0.0001;
			}
			queryService.getContainerCube(function(res) {
						$('box20Count').value = parseInt(res[0] / cbm)
								* boxObCount;
						$('box40Count').value = parseInt(res[1] / cbm)
								* boxObCount;
						$('box40hqCount').value = parseInt(res[2] / cbm)
								* boxObCount;
						$('box45Count').value = parseInt(res[3] / cbm)
								* boxObCount;
						updateMapValue(rdm, "box20Count", $('box20Count').value);
						updateMapValue(rdm, "box40Count", $('box40Count').value);
						updateMapValue(rdm, "box40hqCount",
								$('box40hqCount').value);
						updateMapValue(rdm, "box45Count", $('box45Count').value);
					});

		}
	}

	// 通过外包装数计算毛净重和装箱数
	function calWandC(txt, newVal, oldVal) {
		var rec = null;
		var rdm = $('rdm').value;
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		if (index != -1) {
			rec = ds.getAt(index);
		} else {
			return;
		}
		var boxCbm = rec.data.boxCbm;
		var boxWeigth = $('boxWeigth').value;
		if (rdm != null && rdm != "") {
			if (newVal == "") {
				newVal = 0;
			}
			if (boxWeigth == "") {
				boxWeigth = 0;
			}
			if (boxCbm == 0) {
				boxCbm = 0.0001;
			}
			cotElementsService.getDefaultList(function(res) {
						var jin = boxWeigth * newVal / 1000;
						$('boxNetWeigth').value = jin.toFixed(3);
						var boxGrossWeigth = 0;
						if (res.length != 0) {
							if (res[0].grossNum != null) {
								var temp = jin + res[0].grossNum;
								boxGrossWeigth = temp.toFixed(3);
							}
						} else {
							boxGrossWeigth = jin.toFixed(3);
						}
						$('boxGrossWeigth').value = boxGrossWeigth;
						rec.set("boxNetWeigth", jin.toFixed(3));
						rec.set("boxGrossWeigth", boxGrossWeigth);
						updateMapValue(rdm, "boxNetWeigth", jin.toFixed(3));
						updateMapValue(rdm, "boxGrossWeigth", boxGrossWeigth);
					});
			queryService.getContainerCube(function(res) {
						$('box20Count').value = parseInt(res[0] / boxCbm)
								* newVal;
						$('box40Count').value = parseInt(res[1] / boxCbm)
								* newVal;
						$('box40hqCount').value = parseInt(res[2] / boxCbm)
								* newVal;
						$('box45Count').value = parseInt(res[3] / boxCbm)
								* newVal;
						updateMapValue(rdm, "box20Count", $('box20Count').value);
						updateMapValue(rdm, "box40Count", $('box40Count').value);
						updateMapValue(rdm, "box40hqCount",
								$('box40hqCount').value);
						updateMapValue(rdm, "box45Count", $('box45Count').value);
					});

		}
	}

	// 计算英寸
	function calInch(txt, newVal, oldVal) {
		// var rdm = $('rdm').value;
		// if (rdm == null || rdm == "") {
		// return;
		// }
		// var inch = (newVal / 2.54).toFixed("2");
		// var needId = txt.getName() + "Inch";
		// $(needId).value = inch;
		// updateMapValue(rdm, needId, inch);
		changeSizeTxt();
		// if (sizeFollow == 1) {
		// // 产品包装尺寸跟着变化
		// if (needId == 'boxLInch') {
		// $('boxPbL').value = $('boxL').value;
		// updateMapValue(rdm, "boxPbL", $('boxPbL').value);
		// $('boxPbLInch').value = $('boxLInch').value;
		// updateMapValue(rdm, "boxPbLInch", $('boxPbLInch').value);
		// }
		// if (needId == 'boxWInch') {
		// $('boxPbW').value = $('boxW').value;
		// updateMapValue(rdm, "boxPbW", $('boxPbW').value);
		// $('boxPbWInch').value = $('boxWInch').value;
		// updateMapValue(rdm, "boxPbWInch", $('boxPbWInch').value);
		// }
		// if (needId == 'boxHInch') {
		// $('boxPbH').value = $('boxH').value;
		// updateMapValue(rdm, "boxPbH", $('boxPbH').value);
		// $('boxPbHInch').value = $('boxHInch').value;
		// updateMapValue(rdm, "boxPbHInch", $('boxPbHInch').value);
		// }
		// }
		// calPrice();
	}

	// 计算CM
	function calCm(txt, newVal, oldVal) {
		var rdm = $('rdm').value;
		if (rdm == null || rdm == "") {
			return;
		}
		var cm = (newVal * 2.54).toFixed("2");
		var needId = txt.getName().substring(0, txt.getName().length - 4);
		$(needId).value = cm;
		updateMapValue(rdm, needId, cm);
		changeSizeTxt();
		if (sizeFollow == 1) {
			// 产品包装尺寸跟着变化
			if (needId == 'boxLInch') {
				$('boxPbL').value = $('boxL').value;
				updateMapValue(rdm, "boxPbL", $('boxPbL').value);
				$('boxPbLInch').value = $('boxLInch').value;
				updateMapValue(rdm, "boxPbLInch", $('boxPbLInch').value);
			}
			if (needId == 'boxWInch') {
				$('boxPbW').value = $('boxW').value;
				updateMapValue(rdm, "boxPbW", $('boxPbW').value);
				$('boxPbWInch').value = $('boxWInch').value;
				updateMapValue(rdm, "boxPbWInch", $('boxPbWInch').value);
			}
			if (needId == 'boxHInch') {
				$('boxPbH').value = $('boxH').value;
				updateMapValue(rdm, "boxPbH", $('boxPbH').value);
				$('boxPbHInch').value = $('boxHInch').value;
				updateMapValue(rdm, "boxPbHInch", $('boxPbHInch').value);
			}
		}
		calPrice();
	}

	// 中英文规格跟着变化
	function changeSizeTxt() {
		var rdm = $('rdm').value;
		if (rdm == null || rdm == "") {
			return;
		}
		var str = "";
		if ($('boxL').value != '' && $('boxL').value != '0') {
			str += $('boxL').value + "x";
		}
		if ($('boxW').value != '' && $('boxW').value != '0') {
			str += $('boxW').value + "x";
		}
		if ($('boxH').value != '' && $('boxH').value != '0') {
			str += $('boxH').value + "cm";
			$('eleInchDesc').value = str;
		} else {
			if (str == "") {
				$('eleInchDesc').value = "";
			} else {
				$('eleInchDesc').value = str.substring(0, str.length - 1)
						+ "cm";
			}
		}
		updateMapValue(rdm, "eleInchDesc", $('eleInchDesc').value);

	};

	// 手动修改各个包材价格时修改单个价格及生产价
	function calPackPriceAndPriceFac() {
		var packingPrice = $('packingPrice').value;
		var pbPrice = $('boxPbPrice').value;
		var ibPrice = $('boxIbPrice').value;
		var mbPrice = $('boxMbPrice').value;
		var obPrice = $('boxObPrice').value;

		var boxObCount = $('boxObCount').value;
		var boxMbCount = $('boxMbCount').value;
		var boxIbCount = $('boxIbCount').value;
		var boxPbCount = $('boxPbCount').value;

		var boxIbPrice = 0;
		var boxMbPrice = 0;
		var boxObPrice = 0;
		var boxPbPrice = 0;
		var igPrice = 0;
		var igPrice = $('inputGridPrice').value;
		if (igPrice == null || igPrice == '') {
			igPrice = 0;
		}

		if (boxIbCount > 0 && boxObCount > 0 && ibPrice != ''
				&& ibPrice != null) {
			boxIbPrice = (parseFloat(ibPrice) * parseInt(boxObCount) / parseInt(boxIbCount))
					.toFixed(3);
		}
		if (boxMbCount > 0 && boxObCount > 0 && mbPrice != ''
				&& mbPrice != null) {
			boxMbPrice = (parseFloat(mbPrice) * parseInt(boxObCount) / parseInt(boxMbCount))
					.toFixed(3);
		}
		if (boxObCount > 0 && obPrice != '' && obPrice != null) {
			boxObPrice = parseFloat(obPrice).toFixed(3);
		}
		if (boxPbCount > 0 && boxObCount > 0 && pbPrice != ''
				&& pbPrice != null) {
			boxPbPrice = (parseFloat(pbPrice) * parseInt(boxObCount) / parseInt(boxPbCount))
					.toFixed(3);
		}

		if (boxObCount != 0 && boxObCount != '') {
			packingPrice = ((parseFloat(boxIbPrice) + parseFloat(boxMbPrice)
					+ parseFloat(boxPbPrice) + parseFloat(boxObPrice) + parseFloat(igPrice)) / parseInt(boxObCount))
					.toFixed(facNum);
		}
		$('packingPrice').value = packingPrice;
		// 计算生产价
		calPriceByPakingPrice(packingPrice);
	}

	// 手动修改单个价格时
	function calPriceByPakingPrice(packPrice) {
		if (packPrice == '' || isNaN(packPrice)) {
			packPrice = 0;
		}
		var rdm = $('rdm').value;
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		cotOrderService.calPriceFacByPackPrice(rdm, packPrice, function(
						facprice) {
					if (facprice != -1 && index != -1) {
						var rec = ds.getAt(index);
						rec.set("priceFac", facprice);
					}
				});

	}

	// 加载其他费用
	// 第一次显示其它费用页面.再点不刷新
	var freshFlag = false;
	// 显示其它费用页面
	// function loadOtherInfo() {
	// var isMod = getPopedomByOpType(vaildUrl, "OTHER");
	// if (isMod == 0) {
	// Ext.MessageBox.alert('Message', '对不起,您没有操作其它费用的权限!');
	// } else {
	// if (freshFlag == false) {
	// var frame = document.otherInfo;
	// frame.location.href = "cotorder.do?method=queryOther&source=order&fkId="
	// + $('pId').value;
	// }
	// freshFlag = true;
	// }
	// }
	// // 显示计划日期页面
	// function loadTimeInfo() {
	// if ($('pId').value != '' && $('pId').value != 'null') {
	// if (freshFlag == false) {
	// var frame = document.timeInfo;
	// frame.location.href = "cotorder.do?method=queryTime&orderId="
	// + $('pId').value;
	// }
	// freshFlag = true;
	// } else {
	// Ext.MessageBox.alert("Message",
	// "Please save the order, and then set the plan date!");
	// }
	// }

	// 给其他费用页面调用,验证主表单
	this.checkParent = function() {
		// 验证表单
		var formData = getFormValues(orderForm, true);
		// 表单验证失败时,返回
		if (!formData) {
			return false;
		} else {
			return true;
		}
	}

	// 更新至产品采购和包材采购唛头信息
	function updateMb() {
		if ($("pId").value == '' || $("pId").value == 'null') {
			Ext.MessageBox.alert("message",
					"Pls. save the order, and then update!");
			return;
		}
		var orderZM = $('orderZMArea').value;
		var orderCM = $('orderCMArea').value;
		var orderZHM = $('orderZHMArea').value;
		var orderNM = $('orderNMArea').value;
		var productM = $('productArea').value;

		DWREngine.setAsync(false);
		cotOrderService.updateMb($("pId").value, orderZM, orderCM, orderZHM,
				orderNM, productM, function(res) {
					Ext.MessageBox.alert('Message', "Updated successfully!");
				});
		DWREngine.setAsync(true);
	}

	// 设置退税率
	function setTuiLv(hsId) {
		var rec = null;
		var rdm = $('rdm').value;
		if (rdm == null || rdm == "") {
			return;
		}
		// 在表格中查找rdm所在的行
		var index = ds.find('rdm', rdm);
		if (index != -1) {
			rec = ds.getAt(index);
		}
		updateMapValue(rdm, "eleHsid", hsId);
		DWREngine.setAsync(false);
		cotOrderService.getTuiLv(hsId, function(ft) {
					if (ft != null) {
						rec.set("tuiLv", ft);
						updateMapValue(rdm, "tuiLv", ft);
						// 计算价格
						var ck = rec.data.checkFlag;
						if (ck == null || ck == 0 || ck == false) {
							// 将计算单价的参数组成一个map
							var mapPrice = {};
							mapPrice.clauseTypeId = $('clauseTypeId').value;// 价格条款
							mapPrice.currencyId = $('currencyId').value;// 币种
							mapPrice.orderProfit = rec.data.liRun;// 利润率
							mapPrice.tuiLv = ft;// 退税率
							mapPrice.orderFob = $('orderFob').value;// FOB
							mapPrice.orderRate = $('orderRate').value;// 汇率
							mapPrice.orderCharge = $('orderCharge').value;// 整柜运费
							mapPrice.insureRate = $('insureRate').value;// 保险费率
							mapPrice.insureAddRate = $('insureAddRate').value;// 保险加成率
							mapPrice.containerTypeId = $('containerTypeId').value;// 集装箱类型
							cotOrderService.getNewPriceByTuiLv(mapPrice, rdm,
									function(res) {
										if (res != null) {
											rec.set("orderPrice", res
															.toFixed(deNum));
											updateMapValue(rdm, "orderPrice",
													res.toFixed(deNum));
										}
									})
						}
					}
				});
		DWREngine.setAsync(true);
	}

	// 显示模板面板
	var shenPanel;
	function showShenPnl(item, pressed) {
		if ($('shenDiv') == null) {
			// window默认在z-index为9000
			Ext.DomHelper.append(document.body, {
				html : '<div id="shenDiv" style="position:absolute;z-index:9500;"></div>'
			}, true);
		}
		if (shenPanel == null) {
			shenPanel = new Ext.form.FormPanel({
						labelWidth : 90,
						padding : "5px",
						height : 80,
						width : 280,
						layout : 'hbox',
						frame : true,
						title : "Request Audit",
						labelAlign : "right",
						layoutConfig : {
							padding : '5',
							align : 'middle'
						},
						defaults : {
							margins : '0 5 0 0'
						},
						tools : [{
									id : "close",
									handler : function(event, toolEl, p) {
										p.hide();
									}
								}],
						items : [{
									xtype : "label",
									text : "Approve Person:",
									width : 100
								}, empShenBox, {
									xtype : "button",
									flex : 1,
									text : "OK",
									iconCls : "page_table_save",
									handler : qingShen
								}]
					});

			var tag = item.getEl();
			var left = Ext.Element.fly(tag).getX();
			var top = Ext.Element.fly(tag).getY();
			Ext.Element.fly("shenDiv").setLeftTop(left - 80, top - 90);
			shenPanel.render("shenDiv");
		} else {
			if (!shenPanel.isVisible()) {
				shenPanel.show();
			} else {
				shenPanel.hide();
			}
		}
	};

	function changeBarcode() {
		var rdm = $('rdm').value;
		if (rdm == null || rdm == "") {
			return;
		}
		var bar = setBarcodeNo();
		DWREngine.setAsync(false);
		cotOrderService.updateMapValueByEleId(rdm, "barcode", bar,
				function(res) {
					var index = ds.find('rdm', rdm);
					if (index != -1) {
						var record = ds.getAt(index);
						if (record.data.rdm == rdm) {
							// var temp = record.data.rdm;
							// record.set("rdm", temp + "aaa");
							// record.set("rdm", temp);
							record.set("barcode", bar);
						}
					}
				});
		DWREngine.setAsync(true);
	}

	// 显示模板面板
	var modlElePanel;
	function showEleModel(item, pressed) {
		// 添加权限判断
		var isPopedom = getPopedomByOpType("cotelements.do", "ADD");
		if (isPopedom == 0) {
			Ext.Msg.alert("Message", "You do not have permission to add!");
			return;
		}

		if ($('importDiv') == null) {
			// window默认在z-index为9000
			Ext.DomHelper.append(document.body, {
				html : '<div id="importDiv" style="position:absolute;z-index:9500;"></div>'
			}, true);
		}
		if (modlElePanel == null) {
			modlElePanel = new Ext.form.FormPanel({
						labelWidth : 90,
						padding : "5px",
						height : 200,
						width : 290,
						layout : 'form',
						frame : true,
						title : "Create New No.",
						labelAlign : "right",
						tools : [{
									id : "close",
									handler : function(event, toolEl, p) {
										p.hide();
									}
								}],
						buttonAlign : 'right',
						buttons : [{
									text : "Create",
									iconCls : "page_table_save",
									handler : windowopen
								}],
						items : [typeBox, type2Box, type3Box, facEleBox]
					});
			var tag = item.getEl();
			var left = Ext.Element.fly(tag).getX();
			var top = Ext.Element.fly(tag).getY();
			Ext.Element.fly("importDiv").setLeftTop(left - 80, top + 30);
			modlElePanel.render("importDiv");
			// $('modelEle').focus();
		} else {
			if (!modlElePanel.isVisible()) {
				modlElePanel.show();
			} else {
				modlElePanel.hide();
			}
		}
	};
});
// 锁定价格列全选/反选
function checkAll(obj) {
	checkColumn.checkAll(obj.checked);
}
