{
    let view = {
        el: '.tabs',
        $el: null,
        init(){
            this.$el = $(this.el)
        }
    }
    let model = {}
    let controller = {
        tab: '',
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.locationInit()
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            this.view.$el.find('.tabs-nav').on('click','li',(e)=>{
                let $li = $(e.currentTarget)
                $li.addClass('active').siblings().removeClass('active')
                let tabName = $li.attr('data-tab-name')
                location.href = `index.html?tab=${tabName}`
                // window.eventHub.emit('select',tabName)
            })
        },
        bindEventHub(){
            
        },
        locationInit(){
            let search = location.search
            if(!search){
                location.href += `?tab=page-1`
            }
            this.tab = search.substring(1).split('=')[1]
            this.positionTab()
        },
        positionTab(){
            let tabs = ['page-1','page-2','page-3']
            tabs.map(tab=>{
                if(this.tab === tab){
                    this.view.$el.find(`.tab-content > .${tab}`).addClass('active')
                    this.view.$el.find(`.tabs-nav > li[data-tab-name=${tab}]`).addClass('active')
                }else{
                    this.view.$el.find(`.tab-content > .${tab}`).removeClass('active')
                    this.view.$el.find(`.tabs-nav > li[data-tab-name=${tab}]`).removeClass('active')
                }
            })
        }
    }
    controller.init(view, model)
}