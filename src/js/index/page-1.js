{
    let view =  {
        el: '.page-1',
        $el: null,
        init(){
            this.$el = $(this.el)
        },
        show(){
            this.$el.addClass('active')
        },
        hide(){
            this.$el.removeClass('active')
        }
    }
    let model = {

    }
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.bindEvent()
            this.bindEventHub()
            this.module1()
            this.module2()
        },
        module1(){
            this.appendScript('./js/index/page-1-1.js')      
        },
        module2(){
            this.appendScript('./js/index/page-1-2.js')
        },
        appendScript(str){
            let script = document.createElement('script')
            script.src = str
            document.body.appendChild(script)
        },
        bindEvent(){
            
        },
        bindEventHub(){
            window.eventHub.on('select',(tabName)=>{
                if(tabName === 'page-1'){
                    this.view.show()
                }else{
                    this.view.hide()
                }
            })
        }
    }
    controller.init(view, model)
}