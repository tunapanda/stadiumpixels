<html>
	<head>
		<style>
			html, body {
				margin: 0;
				padding: 0;
			}

			.page {
				width: 300px;
				height: 400px;
				background: #ffffff;
				padding: 10px;
				margin: 5px;
				display: inline-block;
				position: relative;
				border: 1px solid black;
			}

			.row {
				position: relative;
				height: 50px;
			}

			.intro {
				position: relative;
				height: 50px;
			}

			.program {
				position: absolute;
				left: 0px;
				border-radius: 5px;
				padding: 10px;
			}

			.instruction {
				position: absolute;
				left: 150px;
				border-radius: 5px;
				padding: 10px;
			}

			.row .program, .row .instruction {
				background: #000000;
				color: #ffffff;
			}

			.intro .program, .intro .instruction {
				width: 120px;
				background: #f0f0f0;
			}

			.footer {
				position: absolute;
				bottom: 5;
			}
		</style>
	</head>
	<body>
		{% for page in pages %}
			<div class="page">
				<h1>Welcome</h1>
				<p>
					These are your instructions for being a human pixel.<br/><br/>
					They are specific to your seat, please don't lose them or swap them with your neighbour.
				</p>

				<div class="intro">
					<div class="program">
						For this program:
					</div>
					<div class="instruction">
						Show this color:
					</div>
				</div>

				{% for instruction in page.instructions %}
					<div class="row">
						<div class="program">
							{{instruction.program}}
						</div>

						<div class="instruction">
							{% if instruction.value %}
								black
							{% else %}
								white
							{% endif %}
						</div>
					</div>
				{% endfor %}
				<div class="footer">
					Seat: {{page.reverseRowCustom}} - {{page.reverseSeat}}
				</div>
			</div>
		{% endfor %}
	</body>
</html>