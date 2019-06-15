let testMoudle={
    render:()=>{
        console.log("react render");
        ReactDOM.render(
          React.createElement('div', null, 'Hello Micro Front For React'),
            document.getElementById('root')
        );

    },
    destory:()=>{
        //destroy方法
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));

    }
};

export default testMoudle;
