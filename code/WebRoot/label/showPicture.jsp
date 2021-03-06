<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
	String webapp=request.getContextPath();
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>样品其他图片演示</title>
		<!-- 导入公共js和css -->
		<jsp:include page="/common.jsp"></jsp:include>
		<!-- 导入dwr -->
		<script type='text/javascript'
			src='<%=webapp %>/dwr/interface/cotLabelService.js'></script>
		<script type="text/javascript"
			src="<%=webapp %>/common/jquery/jquery.js"></script>
		<script type="text/javascript"
			src="<%=webapp %>/common/jquery/thickbox.js"></script>

		<link rel="stylesheet" href="<%=webapp %>/common/jquery/thickbox.css"
			type="text/css" media="screen" />
		<script>
		var currentPage = 1; //当前页
		var currentIndex = 0; //当前索引
		var totalCount = 0;   //总记录数
		var countOnEachPage = 10;//每页记录数
		var pageCount = 1;    //总页数
		var cotPicture = new CotLabelPicture();
		//翻到第一页
		function getFirst()
		{
			currentPage = 1;
			document.getElementById("currentpage").value = currentPage;
			checkPage();
			
		}
		//翻倒最后一页
		function getLast()
		{
			currentPage = pageCount;
			currentIndex = pageCount*countOnEachPage;
			document.getElementById("currentpage").value = currentPage;
			checkPage();
		}
		//上翻页
		function getPrev()
		{
			currentPage--;
			if(currentPage < 1)
				currentPage = 1;
			document.getElementById("currentpage").value = currentPage;
			checkPage();
		}
		//向下翻页
		function getNext()
		{
			currentPage++
			if(currentPage > pageCount)
				currentPage = pageCount;
			document.getElementById("currentpage").value = currentPage;
			checkPage();
		}
		//获取总页数
		function getPageCount()
		{
			var i = totalCount / countOnEachPage;
			pageCount = Math.ceil(i);
			document.getElementById("pagecount").innerHTML = pageCount;
			return pageCount;
		}
		function query(requireCount,requireInit)
		{
			DWRUtil.useLoadingMessage("正在加载数据，请等待..........."); 
			DWREngine.setAsync(false);
			//是否需要初始化查询工具条
			if(requireInit)
				initToolBar();
			cotLabelService.getOtherPicHtml(currentPage,countOnEachPage,cotPicture,480,680,function(res){
				var imgInfo = document.getElementById("impageInfo");
				imgInfo.innerHTML = res;
				initTB();
			});
			//查询时是否需要重新查询总记录数
			if(requireCount)
			{
				getTotalCount();
				getPageCount();
			}
			checkPage();
			DWREngine.setAsync(true);
			//document.getElementById("btnShow").disabled = false;
			
		}
		//初始化图片查看器
		function initTB()
		{
			tb_init('a.thickbox, area.thickbox, input.thickbox');
		}
		//初始化翻页工具
		function initToolBar()
		{
			getFirst();
		}
		function initPage()
		{
			//初始化下拉列表框
			//bindSel();
			//DWREngine.setAsync(false);
			//初始化总记录数
			//getTotalCount();
			//初始化总页面数
			//getPageCount();
			initToolBar();
			setImgAllGrey("first","previous","last","next","gopage");
			 var eId = document.getElementById("mainId").value;
			 if(eId!='null' && eId!=''){
			 	cotPicture.labelId = eId;
				query(true,true);
			 }
			
			//DWREngine.setAsync(true);
		}
		function getTotalCount()
		{
			cotLabelService.findOtherPicCount(cotPicture,function(res){
				totalCount = res;
				document.getElementById("totalcount").innerHTML = totalCount;
			});
		}
		//加载下拉框数据
		function bindSel()
		{
			sysdicutil.getDicListByName('factory',function(res){
				bindSelect('factoryId',res,'id','shortName');
			});
			sysdicutil.getDicListByName('typelv1',function(res){
				bindSelect('eleTypeidLv1',res,'id','cnEnName');
			});
		}
		//翻页动作
		function pageAction(type)
		{
			if(type == "first")
				getFirst();
			else if(type == "prev")
				getPrev();
			else if(type == "next")
				getNext();
			else if(type == "last")
				getLast();
			query(false,false);	
		}
		//设置按钮可见度
		function setImgStyle(normalType,relateNormalType,greyType,relateGreyType,gobutton)
		{
			var strGreyType = greyType;
			document.getElementById(strGreyType).src = "<%=webapp %>/common/images/"+strGreyType+"_grey.gif";
			document.getElementById(strGreyType).disabled = true;
			var strRelateGreyType = relateGreyType;
			document.getElementById(strRelateGreyType).src = "<%=webapp %>/common/images/"+strRelateGreyType+"_grey.gif";
			document.getElementById(strRelateGreyType).disabled = true;
			var strRelateNormalType = relateNormalType;
			document.getElementById(strRelateNormalType).src = "<%=webapp %>/common/images/"+strRelateNormalType+".gif";
			document.getElementById(strRelateNormalType).disabled = false;
			var strNormalType = normalType;
			document.getElementById(strNormalType).src = "<%=webapp %>/common/images/"+strNormalType+".gif";	
			document.getElementById(strNormalType).disabled = false;	
			
			document.getElementById(gobutton).disabled = false;
		}
		//置灰所有按钮
		function setImgAllGrey(normalType,relateNormalType,greyType,relateGreyType,gobutton)
		{
			var strGreyType = greyType;
			document.getElementById(strGreyType).src = "<%=webapp %>/common/images/"+strGreyType+"_grey.gif";
			document.getElementById(strGreyType).disabled = true;
			
			var strRelateGreyType = relateGreyType;
			document.getElementById(strRelateGreyType).src = "<%=webapp %>/common/images/"+strRelateGreyType+"_grey.gif";
			document.getElementById(strRelateGreyType).disabled = true;
			
			var strRelateNormalType = relateNormalType;
			document.getElementById(strRelateNormalType).src = "<%=webapp %>/common/images/"+strRelateNormalType+"_grey.gif";
			document.getElementById(strRelateNormalType).disabled = true;
			
			var strNormalType = normalType;
			document.getElementById(strNormalType).src = "<%=webapp %>/common/images/"+strNormalType+"_grey.gif";	
			document.getElementById(strNormalType).disabled = true;
			
			document.getElementById(gobutton).disabled = true;
			
		}
		//置亮所有按钮
		function setImgAllLight(normalType,relateNormalType,greyType,relateGreyType,gobutton)
		{
			var strGreyType = greyType;
			document.getElementById(strGreyType).src = "<%=webapp %>/common/images/"+strGreyType+".gif";
			document.getElementById(strGreyType).disabled = false;
			
			var strRelateGreyType = relateGreyType;
			document.getElementById(strRelateGreyType).src = "<%=webapp %>/common/images/"+strRelateGreyType+".gif";
			document.getElementById(strRelateGreyType).disabled = false;
			
			var strRelateNormalType = relateNormalType;
			document.getElementById(strRelateNormalType).src = "<%=webapp %>/common/images/"+strRelateNormalType+".gif";
			document.getElementById(strRelateNormalType).disabled = false;
			
			var strNormalType = normalType;
			document.getElementById(strNormalType).src = "<%=webapp %>/common/images/"+strNormalType+".gif";	
			document.getElementById(strNormalType).disabled = false;
			
			document.getElementById(gobutton).disabled = false;
			
		}
		//改变每页显示条数记录
		function queryOnchange()
		{
			var sel = document.getElementById("percount");

			countOnEachPage = parseInt(sel.value);
			query(true,true);
			if(sel.value >= totalCount)
			{
				setImgAllGrey("last","next","first","previous","gopage");
			}
		}
		//跳转到指定页面
		function goPage()
		{
			
			var value = parseInt(document.getElementById("currentpage").value);
			if(isNaN(value))
			{
				alert("请输入数字");
				return;
			}
			if(value < 1)
			{
				alert("输入页数不能小于1");
				return;
			}
			if(value > pageCount)
			{
				alert("输入页数不能大于总页数");
				return;
			}
			//翻到第一页
			if(value <= 1)
				setImgStyle("last","next","first","previous","gopage");
			else if(value >= pageCount)
				setImgStyle("first","previous","last","next","gopage");
			else 
				setImgAllLight("first","previous","last","next","gopage");
			currentPage = value;
			query(false,false);
		}
		function checkPage()
		{
			var value = parseInt(document.getElementById("currentpage").value);
			//翻到第一页
			if(value <= 1)
				setImgStyle("last","next","first","previous","gopage");
			else if(value >= pageCount)
				setImgStyle("first","previous","last","next","gopage");
			else 
				setImgAllLight("first","previous","last","next","gopage");
			//既是第一页,又是最后一页
			if(value == 1 && value  ==  pageCount)
				setImgAllGrey("last","next","first","previous","gopage");
		}
		 
		var intervalId = 0;
		function showPic(time)
		{
			var aList = document.getElementsByTagName("a");
			if(!aList) //无记录直接返回
				return;
			var aEle = aList[0];
			aEle.fireEvent("onclick");
			var interval = document.getElementById("timeInterval"); 
			intervalId = setInterval(autoShow,parseInt(interval.value)*1000);
             
		}
		function autoShow()
		{
			var fireOnThis = document.getElementById("TB_next");
			if(!fireOnThis)
			{
				clearInterval(intervalId);
				alert("演示完毕！");
				intervalId = 0;
				return;
			}
            if (document.createEventObject)
            {
                fireOnThis.fireEvent('onclick');
            }
		}
		 
		//删除图片
		function delPic(id)
		{
			//设置权限为空
			mapPopedom = null;
			var isModPic = getPopedomByOpType("cotpicture.do","DEL");
			if(isModPic==0){//没有修改图片信息权限
				alert("对不起，您没有删除权限!");
				return;
			}else{
			    var flag = window.confirm("是否确定删除?");
			    if(flag){
			    	DWREngine.setAsync(false); 
			    	cotLabelService.deletePictureByPicId(parseInt(id),function(res){
			    		if(res==false){
							alert("删除失败!");
						}else{
							query(true,true);
						}
					})
					DWREngine.setAsync(true); 
			    }
		    }
		}
		
		//显示上传图片层
		function showUploadDiv(e){
			//设置权限为空
			mapPopedom = null;
			var isPopedom = getPopedomByOpType("cotlabel.do","PIC");
			if(isPopedom == 0) //没有添加图片权限
			{
				alert("您没有添加图片的权限!");
				return;
			}else{
				var obj =document.getElementById("uploadDiv").style.display;
				if(obj=='none' || obj==''){
					//设置层显示位置
					var t=e.offsetTop;
					var l=e.offsetLeft;
					while(e=e.offsetParent){
						t+=e.offsetTop;
						l+=e.offsetLeft;
					}
					var frame = document.uploadTabFrame;
					var eId = document.getElementById("mainId").value;
			 		if(eId!='null' && eId!=''){
						cotPicture.labelId = eId;
			 		}
					frame.location.href = "cotlabel.do?method=showOtherPic&eId="+eId;
					document.getElementById("uploadDiv").style.top=t+20;
					document.getElementById("uploadDiv").style.left=l-280;
					document.getElementById("uploadDiv").style.display ="block";
				}else{
					document.getElementById("uploadDiv").style.display='none';
				}
			}
			
		}
		
		//关闭
		function closeDiv(){ 
			document.getElementById("uploadDiv").style.display ="none"; 
			query(true,true);
		}
		
		//点击图片上传层外的地方后隐藏该层
		function hideDiv()
		{
			var down = event.srcElement.id;
			if(down!="uploadTable" && down!="uploadChildPicBtn" 
			&& down!="showUploadBtn" && down!="controlPanel" 
			&& down!="file" && down!="uploadButton" && down!="uploadParentPicBtn")
				document.getElementById("uploadDiv").style.display ='none';
		}
		
	</script>
	</head>
	<%
	String eId = request.getParameter("eId");
	%>
	<body onload="initPage()" onclick="hideDiv()">

		<div id="picBtn" class="toolbar" style="display: ">
			<div style="float: right; margin-right: 5px">
				<a onclick="showUploadDiv(this)"
					style="cursor: hand; margin-right: 0px;"><img
						src="<%=webapp %>/common/images/bar_up.gif" border="0"
						id="showUploadBtn" height="21px" width="61px">
				</a>
			</div>
		</div>
		<div align='center'>
			<label>
				<font color=red>（友情提示：点击图片可进入图片浏览模式,键盘左右键查看上下图片）</font>
			</label>
		</div>
		<div id="pageInfo" style="margin-left: 30px; margin-top: 10px">
			<input type="image" id="first"
				src="<%=webapp %>/common/images/first.gif" alt="第一页" border="0"
				onclick="pageAction('first');" />
			<input type="image" id="previous"
				src="<%=webapp %>/common/images/previous.gif" alt="上一页" border="0"
				onclick="pageAction('prev');" />
			<input type="image" id="next" src="<%=webapp %>/common/images/next.gif"
				alt="下一页" border="0" onclick="pageAction('next');" />
			<input type="image" id="last" src="<%=webapp %>/common/images/last.gif"
				alt="最后页" border="0" onclick="pageAction('last');" />
			<label>
				每页
			</label>
			<select id="percount" style="width: 40px;"
				onchange="queryOnchange();">
				<option value=10>
					10
				</option>
				<option value=20>
					20
				</option>
				<option value=30>
					30
				</option>
				<option value=50>
					50
				</option>
				<option value=100>
					100
				</option>
			</select>
			<label>
				条
			</label>
			<label>
				当前第
			</label>
			<input id="currentpage" value=1 style="width: 27px; height: 18px">
			<label>
				页
			</label>
			<button class="displayBtn" style="width: 30px; height: 21px"
				id="gopage" onclick="goPage();">
				<label style="cursor: hand; color: #000;">
					go
				</label>
			</button>
			<label>
				/
			</label>
			<label>
				共
			</label>
			<label id="pagecount">
				0
			</label>
			<label>
				页
			</label>
			<label>
				|
			</label>
			<label>
				共
			</label>
			<label id="totalcount">
				0
			</label>
			<label>
				条记录
			</label>
			<%--
        	    <button class="displayBtn" style="width:30px;height:22px;" id="btnShow" onclick="showPic(1000)" disabled >
					<label style="cursor:hand;color:#000;">
						演示
					</label>
				</button>
				<label>间隔:</label>
				<select id="timeInterval" style="width:60px;">
					<option value=1>1秒</option>
					<option value=2>2秒</option>
					<option value=3 selected>3秒</option>
					<option value=4>4秒</option>
					<option value=5>5秒</option>
					<option value=6>6秒</option>
					<option value=7>7秒</option>
					<option value=8>8秒</option>
					<option value=9>9秒</option>
					<option value=10>10秒</option>
				</select>
			--%>
		</div>
		<div id="impageInfo"></div>

		<!-------------------------- 文件上传组件(用于子样品信息和图片信息) ------------------------------------->
		<div id="uploadDiv"
			style="display: none; position: absolute; width: 320; background-color: #96CEE5;"
			align="center">
			<iframe name="uploadTabFrame" style="margin: 0" frameBorder="0"
				height="138px" width=100% scrolling=no marginheight=0 marginwidth=0></iframe>
		</div>
		<!-------------------------- 文件上传组件(用于子样品信息和图片信息)(结束) ------------------------------------->
		<input type="hidden" id="mainId" name="mainId" value="<%=eId%>"/>
	</body>
</html>
