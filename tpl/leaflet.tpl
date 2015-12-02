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

			.picture{
				position: absolute;
				margin-left:100px;
				
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
				<!--<div class="picture">
				<image src="tunapandalogo.png" alt="logo.png" style="width:100px;height:100px;">
				</div>-->

				<!--<h1>Welcome</h1>-->
					These are your instructions for being a human pixel.<br/><br/>
					There will be two activities. For the first activity you will hold up 
					a bag with the same color that is written next to the number "1" on this page.
					For the second activity you will hold up 
					a bag with the same color that is written next to the number "2" on this page.
<br/><br/>

				<div class="intro">
					<div class="program">
						Activity:
					</div>
					<div class="instruction">
						Color:
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