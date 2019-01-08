{
    let view = {
        el: '.newSong',
        template: `
            新建歌曲
        `,
        render(data){
            $(this.el).html(this.template)
        }
    }
    let model = {}
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.active()
            this.bindEvent()
            this.bindEventHub()
        },
        active(){
            $(this.view.el).addClass('active')
        },
        deactive(){
            $(this.view.el).removeClass('active')
        },
        bindEvent(){
            $(this.view.el).on('click',()=>{
                this.active()
                window.eventHub.emit('new')
            })
        },
        bindEventHub(){
            window.eventHub.on('upload',()=>{
                this.active()
            })
            window.eventHub.on('select',(data)=>{
                this.deactive()
            })
        }
    }
    controller.init.call(controller, view, model)
}