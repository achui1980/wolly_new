package com.sail.cot.servlet;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.log4j.Logger;

import com.bjinfotech.practice.ajax.Constant;
import com.bjinfotech.practice.ajax.FileUploadListener;
import com.bjinfotech.practice.ajax.FileUploadStatus;
import com.bjinfotech.practice.ajax.MyServletFileUpload;
import com.bjinfotech.practice.ajax.UploadSessionImpl;
import com.bjinfotech.practice.ajax.UploadSessionManager;
import com.bjinfotech.practice.ajax.Utils;
import com.bjinfotech.practice.ajax.XmlUnSerializer;
import com.jason.core.Application;
import com.sail.cot.service.fittingorder.CotFitOrderService;
import com.sail.cot.service.system.CotSysLogService;
import com.sail.cot.util.Log4WebUtil;

/**
 * 配件编辑页面上传图片
 */
public class UploadFitDetailPicServlet extends HttpServlet implements Servlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 946573126457064359L;
	private static final String DOC_DIR = "/sampleImg";
	Logger logger = Log4WebUtil.getLogger(UploadFitDetailPicServlet.class);
	/**
	 * Constructor of the object.
	 */
	public UploadFitDetailPicServlet() {
		super();
	}

	/**
	 * Destruction of the servlet. <br>
	 */
	public void destroy() {
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	/**
	 * The doGet method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to get.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		this.processFileUpload(request, response);
	}

	/**
	 * The doPost method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to post.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String param1 = request.getParameter("test");
		if(param1 != null)
		{
			System.out.println("-------------"+param1);
		}
		
		this.processFileUpload(request, response);
	}

	/**
	 * Initialization of the servlet. <br>
	 *
	 * @throws ServletException if an error occurs
	 */
	public void init() throws ServletException {
		// Put your code here
		ServletContext ctx = this.getServletContext();
		String realPath = ctx.getRealPath(DOC_DIR);
		File fDir = new File(realPath);
		//如果上传目录不存在，创建之
		if(!fDir.exists())
			fDir.mkdir();		
	}
	
	/**
	 * 上传过程中出错处理
	 * @param request
	 * @param errMsg
	 * @param uSessionId
	 * @throws IOException 
	 * @throws ServletException 
	 */
	protected void uploadExceptionHandle(
			HttpServletRequest request,
			String errMsg,
			String uSessionId){
		UploadSessionImpl uSession=UploadSessionManager.getInstance().getUploadSession(uSessionId);
		uSession.getActiveFUSBean().setStatus(errMsg);
		UploadSessionManager.getInstance().addOrUpdateUploadSession(uSession);
	}
	/**
	 * 更新开始/结束处理文件上传时间
	 * @param uSessionId
	 * @param time
	 * @param isStart 是否为开始时间，false表示为结束时间
	 */
	protected void updateProcessStatus(String uSessionId,long time,boolean isStart){
		UploadSessionImpl uSession=UploadSessionManager.getInstance().getUploadSession(uSessionId);
		FileUploadStatus fUploadStatus=uSession.getActiveFUSBean();
		
		if (isStart){
			fUploadStatus.setProcessStartTime(System.currentTimeMillis());
		}
		//更新结束时间时修改传输状态
		else{
			logger.debug("文件上传状态:"+fUploadStatus.getStatus());
			if (fUploadStatus.getCancel()){
				fUploadStatus.setStatus("完成取消处理");
			}
			else if (fUploadStatus.getStatus().indexOf("错误")<0 && fUploadStatus.getStatus().indexOf("上传文件已被病毒感染")<0){
				fUploadStatus.setStatus("完成文件上传处理");
			}
			fUploadStatus.setProcessEndTime(System.currentTimeMillis());
			fUploadStatus.setProcessRunningTime(fUploadStatus.getProcessEndTime()-fUploadStatus.getProcessStartTime());
		}
		uSession.setActiveFUSBean(fUploadStatus);
		UploadSessionManager.getInstance().addOrUpdateUploadSession(uSession);
	}
	public void processFileUpload(HttpServletRequest request, HttpServletResponse response) throws IOException
	{

		String msg = "";
		response.setContentType("text/html");
		response.setCharacterEncoding("utf-8");
		response.setHeader("Cache-Control", "no-cache");
		if (request.getContentLength()>Constant.MAX_ONCE_UPLOAD_SIZE){
			msg = "{success:false,msg:'Uploading Error:The file size exceeds limit"+Constant.MAX_ONCE_UPLOAD_SIZE+" bytes'}";
		}
		else{
			
			DiskFileItemFactory factory = new DiskFileItemFactory();
			//设置内存阀值，超过后写入临时文件
			factory.setSizeThreshold(Constant.UPLOAD_SIZE_THRESHOLD);
			//设置临时文件存储位置
			factory.setRepository(new File(request.getRealPath(DOC_DIR)));
			MyServletFileUpload upload = new MyServletFileUpload(factory);
			//设置单个文件的最大上传size:100M
			upload.setFileSizeMax(Constant.MAX_EACH_FILE_UPLOAD_SIZE);
			//设置整个request的最大size:100M
			upload.setSizeMax(Constant.MAX_ONCE_UPLOAD_SIZE);
			
			upload.setHeaderEncoding("UTF-8");
			
			try {
				List<?> items = upload.parseRequest(request);
				if (items!=null){
					
					//获取页面参数
					HashMap<String, String> map = new HashMap<String, String>();;
					for (int i=0; i<items.size(); i++) {
						FileItem fileItem=(FileItem)items.get(i);
						String fieldName = fileItem.getFieldName();
						if (fieldName != null) {
							map.put(fieldName, fileItem.getString("utf-8"));
						}
					}
					
					for(int i=0;i<items.size();i++){						
						FileItem fileItem=(FileItem)items.get(i);
					
						if (fileItem.getName()!=null && fileItem.getName().length()>0){
							String fileName=Utils.takeOutFileName(fileItem.getName());
							logger.info("处理文件["+fileName+"]:保存路径为"
									+request.getRealPath(DOC_DIR)+File.separator+fileName);
							//将图片后缀名改成png
							int point = fileName.lastIndexOf(".");
							String name = fileName.substring(0,point)+".png";
							String fPath = request.getRealPath(DOC_DIR)+File.separator+name;
							File uploadedFile = new File(fPath);
							fileItem.write(uploadedFile);
							String detailId=(String) map.get("detailId");
							msg  = "{'success':true,fileName:'"+request.getContextPath()+DOC_DIR+"/"+name+"'}";
							if(detailId!=null && !"".equals(detailId) && !"null".equals(detailId)){
								//保存到数据库(更新图片表和样品表)
								CotFitOrderService cotFitOrderService = (CotFitOrderService)this.getService("CotFitOrderService");
								CotSysLogService sysLogService = (CotSysLogService)this.getService("CotSysLogService");
								try {
									cotFitOrderService.updateDefaultPic(fPath, Integer.parseInt(detailId));
									msg  = "{'success':true,fileName:'"+DOC_DIR+File.separator+name+"'}";
								} catch (Exception e) {
									msg = "{'success':false,msg:'保存文件异常'}";
									e.printStackTrace();
								}
							}
						}
					}
				}
			} catch (FileUploadException e) {
				msg = "{'success':false,msg:'Uploading Error:"+e.getMessage()+"'}";
				e.printStackTrace();
			} catch (Exception e) {
				msg = "{'success':false,msg:'Failed to connect to server:"+e.getMessage()+"'}";
				e.printStackTrace();
			}
		}
		System.out.println(msg);
		response.getWriter().write(msg);
	}
	
	private Object getService(String strSerivce)
	{
		return Application.getInstance().getContainer().getComponent(strSerivce);
	}

}
