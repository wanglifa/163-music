{
    let view = {
        el: '.tabs-nav',
        $el: null,
        init(){
            this.$el = $(this.el)
        }
    }
    let model = {}
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            this.view.$el.on('click','li',(e)=>{
                let $li = $(e.currentTarget)
                $li.addClass('active').siblings().removeClass('active')
                let tabName = $li.attr('data-tab-name')
                window.eventHub.emit('select',tabName)
            })
        },
        bindEventHub(){
            
        }
    }
    controller.init(view, model)
}