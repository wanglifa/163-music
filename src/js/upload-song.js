{
    let view = {
        el: '.uploadArea',
        find(selector){
            return $(this.el).find(selector)[0]
        }
    }
    let model = {}
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.initQiniu()
        },
        initQiniu(){
            var uploader = Qiniu.uploader({
                runtimes: 'html5',    //上传模式,依次退化
                browse_button: this.view.find('#uploadButton'),       //上传选择的点选按钮，**必需**
                uptoken_url: 'http://localhost:8888/uptoken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                domain: 'http://pkl6kjvxu.bkt.clouddn.com/',   //bucket 域名，下载资源时用到，**必需**
                get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
                max_file_size: '40mb',           //最大文件体积限制
                dragdrop: true,                   //开启可拖曳上传
                drop_element: this.view.find('#uploadContainer'),        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                init: {
                    'FilesAdded': function(up, files) {
                        plupload.each(files, function(file) {
                            // 文件添加进队列后,处理相关的事情
                        });
                    },
                    'BeforeUpload': function(up, file) {
                            // 每个文件上传前,处理相关的事情
                    },
                    'UploadProgress': function(up, file) {
                            // 每个文件上传时,处理相关的事情
                            uploadStatus.textContent = '上传中'
                    },
                    'FileUploaded': function(up, file, info) {
                    
                            // 每个文件上传成功后,处理相关的事情
                            // 其中 info.response 是文件上传成功后，服务端返回的json，形式如
                            // {
                            //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                            //    "key": "gogopher.jpg"
                            //  }
                            // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
                    
                            var domain = up.getOption('domain');
                            var response = JSON.parse(info.response);
                            var sourceLink = domain + encodeURIComponent(response.key); //获取上传成功后的文件的Url
                            uploadStatus.textContent = sourceLink + ''+ response.key
                            let auth = response.key.split('-')
                            let singer = auth[0].trim()
                            let name = auth[1].trim()
                            window.eventHub.emit('upload',{
                                url: sourceLink,
                                singer,
                                name
                            })
                    },
                    'Error': function(up, err, errTip) {
                            //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function() {
                            //队列文件处理完毕后,处理相关的事情
                    },
                }
            });
        }
    }
    controller.init.call(controller,view,model)

}