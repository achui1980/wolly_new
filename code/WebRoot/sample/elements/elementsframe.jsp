<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String webapp = request.getContextPath();
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" >
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Article Records</title>
		<!-- 导入公共js和css -->
		<jsp:include page="/extcommon.jsp"></jsp:include>
		<link rel="stylesheet" type="text/css" href="<%=webapp %>/common/css/chooser.css" />
		<!-- 导入dwr -->
		<script type='text/javascript'
			src='<%=webapp%>/dwr/interface/cotElementsService.js'></script>
		<script type="text/javascript">
			getFacPodom('cotelements.do');
		</script>
		<script type='text/javascript' src='<%=webapp%>/sample/elements/js/elequery.js'></script>	
		<script type='text/javascript' src='<%=webapp%>/sample/elements/js/batchUpdate.js'></script>
		<script type='text/javascript' src='<%=webapp%>/sample/elements/js/elements.js'></script>	
		<script type='text/javascript' src='<%=webapp%>/common/js/printPanel.js'></script>
		
		<script type="text/javascript" src="<%=webapp %>/common/js/popedom.js"></script>
	</head>

	<body>
	</body>
</html>
