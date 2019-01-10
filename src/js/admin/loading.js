{
    let view = {
        el: '.loading',
        active(){
            $(this.el).addClass('active')
        },
        remove(){
            $(this.el).removeClass('active')
        }
    }
    let controller = {
        view: null,
        init(view){
            this.view = view
            this.bindEventHub()
        },
        bindEventHub(){
            window.eventHub.on('uploading',()=>{
                this.view.active()
            })
            window.eventHub.on('upload',()=>{
                this.view.remove()
            })
        }
    }
    controller.init(view)
}