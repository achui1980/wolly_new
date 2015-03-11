Ext.onReady(function(){
	var form=new Ext.form.FormPanel({
	title:"新增|编辑",
	labelWidth:60,
	labelAlign:"right",
	layout:"form",
	width:400,
	height:260,
	padding:"5px",
	renderTo:Ext.getBody(),
	formId:"queryHsCompanyForm",
	frame:true,
	buttonAlign:"center",
	monitorValid:true,
	fbar:[
		{
			text:"保存",
			formBind:true,
			iconCls:"page_mod",
			handler:mod
		},
		{
			text:"取消",
			iconCls:"page_cancel",
			handler:function(){
				closeandreflashEC(true,"hsGrid",false);
			}
		}
	],
	items:[
		{
			xtype:"textfield",
			fieldLabel:"<font color='red'>中文名</font>",
			allowBlank:false,
			blankText:"请输入中文名",
			id:"hsCompanyName",
			name:"hsCompanyName",
			anchor:"100%"
		},
		{
			xtype:"textfield",
			fieldLabel:"<font color='red'>英文名</font>",
			allowBlank:false,
			blankText:"请输入英文名",
			id:"hsCompanyNameEn",
			name:"hsCompanyNameEn",
			anchor:"100%"
		},
		{
			xtype:"textfield",
			fieldLabel:"联系电话",
			id:"hsContactNbr",
			name:"hsContactNbr",
			anchor:"100%"
		},
		{
			xtype:"textfield",
			id:"hsFax",
			name:"hsFax",			
			fieldLabel:"传真",
			anchor:"100%"
		},
		{
			xtype:"textfield",
			fieldLabel:"联系人",
			id:"hsContantPerson",
			name:"hsContantPerson",			
			anchor:"100%"
		},
		{
			xtype:"textarea",
			fieldLabel:"地址",
			id:"hsAdd",
			name:"hsAdd",
			anchor:"100%"
		}
	]
});
//初始化表单
initForm();
});