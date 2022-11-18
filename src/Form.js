import React from 'react';
// const { Parser, transforms: { unwind } } = require('json2csv');
const { Parser } = require('json2csv');

export default class SimpleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '', projectId: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        switch (target.name) {
            case 'mrId':
                this.setState({ value: target.value });
                break;
            case 'projectId':
                this.setState({ projectId: target.value });
                break;
            default:
                break;
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        fetch(
            `https://pimat.eww.panasonic.com/gitlab/api/v4/projects/${this.state.projectId}/merge_requests/${this.state.value}/discussions`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'PRIVATE-TOKEN': 'glpat-K7zzYDju7AYsdu1YgJNU'
                }
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);

                const input = [];
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].notes.length; j++) {
                        const note = data[i].notes[j];
                        if (note.resolvable) {
                            if (note.type === "DiffNote") {
                                const newNote = { body: [] };
                                newNote.path = `${note.position.new_path}::${note.position.new_line}`;
                                if (note.resolved) newNote.resolved_at = /\d{4}-\d{1,2}-\d{1,2}/g.exec(note.resolved_at)[0];
                                newNote.body.push(`${note.body}【${note.author.name}】`);
                                input.push(newNote);
                            } else if (note.type === "DiscussionNote") {
                                //todo
                            } else {
                                delete data[i].notes[j];
                            }
                        }
                    }
                }

                const output = input.reduce((re, obj) => {
                    const item = re.find((o) => o.path === obj.path);
                    item ? (item.body = item.body.concat(obj.body)) : re.push(obj);
                    return re;
                }, []);

                for (const i in output) {
                    for (const j in output[i].body) {
                        if (j % 2 === 0) {
                            output[i].q = output[i].body[j];
                        } else {
                            output[i].a = output[i].body[j];
                        }
                    }
                }
                console.log(output);

                // version 0.0.2
                const fields = [
                    {
                        label: '指摘位置',
                        value: 'path'
                    },
                    {
                        label: '指摘・質問内容 【指摘者】',
                        value: 'q'
                    },
                    {
                        label: '見解・回答内容 【回答者】',
                        value: 'a'
                    },
                    {
                        label: '完了日',
                        value: 'resolved_at'
                    },
                    {
                        label: 'Diffコメント履歴',
                        value: 'body'
                    },
                ];

                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(output);
                console.log(csv);

                const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=UTF-8,' })
                const objUrl = URL.createObjectURL(blob)
                window.open(objUrl);

                // version 0.0.1
                /** 
                const fields = ['notes.position.new_path', 'notes.position.new_line',
                'notes.author.name', 'notes.body', 'notes.resolved_at'];
                const transforms = [unwind({ paths: ['notes'] })];
                const json2csvParser = new Parser({ fields, transforms });
                const csv = json2csvParser.parse(data);

                const transforms = [unwind({ paths: ['notes.body'] })];
                const json2csvParser = new Parser({ fields, transforms });
                const csv = json2csvParser.parse(data);


                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(newData);

                let csvContent = "data:text/csv;charset=utf-8," + csv.map(e => e.join(",")).join("\n");
                var encodedUri = encodeURI(csvContent);
                document.write(csv);
                */
            })
            .catch((err) => console.log(err));
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <p>
                    <select className='select'
                        name='projectId'
                        required
                        value={this.state.projectId}
                        onChange={this.handleChange}>
                        <option value="" selected hidden disabled>Projectを選択してください</option>
                        <option value="1610">Operation(PSDCD)</option>
                        <option value="1595">Operation(GSOL)</option>
                        <option value="1594">Startup(GSOL)</option>
                        <option value="1387">Printing(GSOL)</option>
                    </select>
                </p>
                <p>
                    <input className='textbox'
                        name='mrId'
                        placeholder="マージリクエストIDを入力してください"
                        type='text'
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                </p>

                <input className='btn' type='submit' value='Submit' />
            </form>
        );
    }


}
