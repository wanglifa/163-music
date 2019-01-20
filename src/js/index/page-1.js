{
    let view =  {
        el: '.page-1',
        $el: null,
        init(){
            this.$el = $(this.el)
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
        }
    }
    controller.init(view, model)
}