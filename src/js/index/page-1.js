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