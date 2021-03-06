import { expect } from 'chai';
import { render } from './../rendering';
import Component from './../../component/es2015';
import { innerHTML } from '../../tools/utils';
import * as Inferno from '../../testUtils/inferno';
Inferno; // suppress ts 'never used' error

describe('Blueprints (JSX)', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		container = null;
	})

	describe('Should have parentDOM defined #1', () => {
		class A extends Component<any, any> {
			render() {
				return <div>A</div>;
			}
		}

		class B extends Component<any, any> {
			render() {
				return <span>B</span>;
			}
		}

		class Counter extends Component<any, any> {
			props: any;

			constructor(props) {
				super(props);
				this.state = {
					bool: false
				};
				this.btnCount = this.btnCount.bind(this);
			}

			btnCount() {
				this.setState({
					bool: !this.state.bool
				});
			}

			render() {
				return (
					<div class="my-component">
						<h1>{ this.props.car } { this.state.bool ? <A /> : <B /> }</h1>
						<button type="button" onClick={ this.btnCount }>btn</button>
					</div>
				);
			}
		}

		class Wrapper extends Component<any, any> {
			constructor(props) {
				super(props);
			}

			render() {
				return (
					<div>
						{ ['Saab', 'Volvo', 'BMW'].map(function(c) {
							return (<Counter car={ c }/>);
						}) }
					</div>
				);
			}
		}

		it('Initial render (creation)', () => {
			render(<Wrapper/>, container);

			expect(
				container.innerHTML
			).to.equal(
				innerHTML('<div><div class="my-component"><h1>Saab <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <span>B</span></h1><button type="button">btn</button></div></div>')
			);

			render(null, container);
		});

		it('Second render (update)', (done) => {
			render(<Wrapper/>, container);
			const buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
			buttons.forEach(button => button.click());

			// requestAnimationFrame is needed here because
			// setState fires after a requestAnimationFrame
			requestAnimationFrame(() => {
				expect(
					container.innerHTML
				).to.equal(
					innerHTML('<div><div class="my-component"><h1>Saab <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <div>A</div></h1><button type="button">btn</button></div></div>')
				);
				render(null, container);
				done();
			});
		});
	});

	describe('Infinite loop issue', () => {
		it('Should not get stuck when doing setState from ref callback', () => {
			class A extends Component<any, any> {
				props: any;

				constructor(props) {
					super(props);

					this.state = {
						text: 'foo'
					};

					this.onWilAttach = this.onWilAttach.bind(this);
				}

				onWilAttach(node) {
					// Do something with node and setState
					this.setState({
						text: 'animate'
					});
				}

				render() {
					if (!this.props.open) {
						return null;
					}

					return (
						<div ref={this.onWilAttach}>
							{this.state.text}
						</div>
					);
				}
			}

			render(<A />, container);

			render(<A open={true}/>, container);
			expect(container.innerHTML).to.equal(innerHTML('<div>animate</div>'));
		});
	});

	describe('Refs inside components', () => {
		it('Should have refs defined when componentDidMount is called', () => {
			class Com extends Component<any, any> {
				_first: any;
				_second: any;

				constructor(props) {
					super(props);
					this._first = null;
					this._second = null;
				}

				componentDidMount() {
					expect(this._first).to.not.equal(null);
					expect(this._second).to.not.equal(null);
				}

				render() {
					return (
						<div ref={(node) => this._first = node}>
							<span>1</span>
							<span ref={(node) => this._second = node}>2</span>
						</div>
					);
				}
			}

			render(<Com />, container);
		});
	});

	describe('Spread operator and templates', () => {
		it('Should be able to update property', () => {
			class A extends Component<any, any> {
				props: any;

				constructor(props) {
					super(props);
				}

				render() {
					return (
						<div>
							<input disabled={ this.props.disabled } {...this.props.args} />
						</div>
					);
				}
			}

			render(<A disabled={true}/>, container);
			let input = container.querySelector('input');
			expect(input.disabled).to.equal(true);

			render(<A disabled={false}/>, container);
			input = container.querySelector('input');
			expect(input.disabled).to.equal(false);
		});
	});
});
