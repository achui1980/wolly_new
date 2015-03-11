package com.sail.cot.action.customer;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

import com.sail.cot.action.AbstractAction;
import com.sail.cot.domain.CotEmps;
import com.sail.cot.query.QueryInfo;
import com.sail.cot.service.customer.CotCustLogService;
import com.sail.cot.util.GridServerHandler;
import com.sail.cot.util.SystemUtil;

public class CotCustLogAction extends AbstractAction {

	private CotCustLogService cotCustLogService;

	public CotCustLogService getCotCustLogService() {
		if (cotCustLogService == null) {
			cotCustLogService = (CotCustLogService) super.getBean("CotCustLogService");
		}
		return cotCustLogService;
	}

	public void setCotCustLogService(CotCustLogService cotCustLogService) {
		this.cotCustLogService = cotCustLogService;
	}

	@Override
	public ActionForward add(ActionMapping mapping, ActionForm form,
			HttpServletRequest request, HttpServletResponse response) {

		return mapping.findForward("add");
	}

	@Override
	public ActionForward modify(ActionMapping mapping, ActionForm form,
			HttpServletRequest request, HttpServletResponse response) {

		return null;
	}

	@Override
	public ActionForward query(ActionMapping mapping, ActionForm form,
			HttpServletRequest request, HttpServletResponse response) {
		String start = request.getParameter("start");
		String limit = request.getParameter("limit");

		if (start == null || limit == null)
			return mapping.findForward("querySuccess");

		String custId = request.getParameter("custId");// 客户
		String empId = request.getParameter("empId");// 业务员
		String logCheck = request.getParameter("logCheck");// 批注状态
		String startTime = request.getParameter("startTime");// 报价起始日期
		String endTime = request.getParameter("endTime");// 报价结束日期

		StringBuffer queryString = new StringBuffer();
		queryString.append(" where obj.empId = e.id and obj.custId = c.id");
		
		// 获得登录人
		CotEmps emp = (CotEmps) request.getSession().getAttribute("emp");
		if (!"admin".equals(emp.getEmpsId())) {
			// 判断是否有最高权限
			boolean all = SystemUtil.isAction(request, "cotemplog.do", "ALL");
			if (all == false) {
				// 判断是否有查看该部门报价的权限
				boolean dept = SystemUtil.isAction(request, "cotemplog.do",
						"DEPT");
				if (dept == true) {
					queryString.append(" and e.deptId=" + emp.getDeptId());
				} else {
					queryString.append(" and obj.empId ="
							+ emp.getId());
				}
			}
		}
		
		if (custId != null && !custId.trim().equals("")) {
			queryString.append(" and obj.custId=" + custId.trim());
		}
		if (empId != null && !empId.trim().equals("")) {
			queryString.append(" and obj.empId=" + empId.trim());
		}
		if (logCheck != null && !logCheck.trim().equals("")) {
			if(logCheck.equals("-1")){
				logCheck="0";
			}
			queryString.append(" and obj.logCheck=" + logCheck.trim());
		}
		if (startTime != null && !"".equals(startTime.trim())) {
			queryString.append(" and obj.logDate >='" + startTime + "'");
		}
		if (endTime != null && !"".equals(endTime.trim())) {
			queryString.append(" and obj.logDate <='" + endTime + " 23:59:59'");
		}

		QueryInfo queryInfo = new QueryInfo();
		// 设置每页显示多少行
		int pageCount = Integer.parseInt(limit);
		// 设定每页显示记录数
		queryInfo.setCountOnEachPage(pageCount);
		//设置查询记录总数语句
		queryInfo.setCountQuery("select count(*) from CotCustLog obj,CotEmps e,CotCustomer c"
				+ queryString);
		//设置查询记录语句
		queryInfo.setSelectString("select obj.id,obj.logDate,obj.logContent," +
				"obj.logCheck,obj.logAdvise,obj.remark,e.empsName,c.customerShortName from CotCustLog obj,CotEmps e,CotCustomer c");
		//设置条件语句
		queryInfo.setQueryString(queryString.toString());
		//设置排序语句
		queryInfo.setOrderString(" order by obj.logCheck asc,obj.id desc");
		
		int count = this.getCotCustLogService().getRecordCount(queryInfo);

		int startIndex = Integer.parseInt(start);
		queryInfo.setStartIndex(startIndex);
		// 根据起始
		List<?> list = this.getCotCustLogService().getCustVOList(queryInfo);
		
		try {
			GridServerHandler gd = new GridServerHandler();
			gd.setData(list);
			gd.setTotalCount(count);
			String json = gd.getLoadResponseText();
			response.getWriter().write(json);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;
	}

	@Override
	public ActionForward remove(ActionMapping mapping, ActionForm form,
			HttpServletRequest request, HttpServletResponse response) {

		return null;
	}

}
