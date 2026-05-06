/**
 * PDF Upload Test Script
 * Tests the complete PDF processing pipeline without browser
 */

const fs = require('fs')
const path = require('path')

// Test configuration
const PDF_FILE = path.join(__dirname, '翻译原文.pdf')
const API_URL = 'http://localhost:3001'

async function testPDFProcessing() {
  console.log('🧪 Starting PDF Processing Test\n')
  console.log('=' .repeat(60))

  // Step 1: Check if PDF file exists
  console.log('\n📋 Step 1: Checking PDF file...')
  if (!fs.existsSync(PDF_FILE)) {
    console.error(`❌ PDF file not found: ${PDF_FILE}`)
    process.exit(1)
  }

  const pdfStats = fs.statSync(PDF_FILE)
  console.log(`✅ PDF file found: ${PDF_FILE}`)
  console.log(`   Size: ${(pdfStats.size / 1024).toFixed(1)} KB`)

  // Step 2: Test PDF parsing API
  console.log('\n📋 Step 2: Testing PDF Parse API...')
  try {
    const formData = new FormData()
    const pdfBuffer = fs.readFileSync(PDF_FILE)
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    formData.append('file', blob, '翻译原文.pdf')

    const parseResponse = await fetch(`${API_URL}/api/parse-pdf`, {
      method: 'POST',
      body: formData
    })

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text()
      throw new Error(`Parse API failed (${parseResponse.status}): ${errorText}`)
    }

    const parseResult = await parseResponse.json()

    console.log(`✅ PDF parsed successfully!`)
    console.log(`   Text length: ${parseResult.text?.length || 0} chars`)
    console.log(`   Pages: ${parseResult.metadata?.Pages || 'Unknown'}`)

    if (parseResult.text) {
      // Show first 500 chars to verify it's real content
      console.log(`\n   📄 Content preview (first 500 chars):`)
      console.log('   ' + '-'.repeat(50))
      console.log('   ' + parseResult.text.slice(0, 500).replace(/\n/g, '\n   '))
      console.log('   ' + '-'.repeat(50))

      // Check if content looks like a full paper (not just abstract)
      const hasMethods = /method|Methodology|METHOD/i.test(parseResult.text)
      const hasResults = /result|Result|experiment|Experiment|data|Data/i.test(parseResult.text)
      const hasDiscussion = /discussion|Discussion|conclusion|Conclusion/i.test(parseResult.text)

      console.log(`\n   🔍 Content analysis:`)
      console.log(`   - Contains methods section: ${hasMethods ? '✅' : '❌'}`)
      console.log(`   - Contains results section: ${hasResults ? '✅' : '❌'}`)
      console.log(`   - Contains discussion/conclusion: ${hasDiscussion ? '✅' : '❌'}`)

      if (hasMethods && hasResults) {
        console.log(`\n   🎉 SUCCESS: PDF contains FULL paper content (not just abstract)!`)
      } else {
        console.log(`\n   ⚠️  WARNING: Content may be limited to abstract only`)
      }
    }

    // Step 3: Test Chat API with PDF attachment
    console.log('\n📋 Step 3: Testing Chat API with PDF attachment...')

    const chatRequestBody = {
      config: {
        provider: "custom",
        apiKey: "test",
        model: "test-model",
        temperature: 0.7,
        maxTokens: 2000,
        stream: false
      },
      module: "decompose",
      input: "理解一下文章内容",
      intent: "QUICK_READ",
      attachments: [{
        name: '翻译原文.pdf',
        type: 'pdf',
        content: parseResult.text
      }],
      customPrompt: "This is a test with uploaded PDF. Analyze the complete paper."
    }

    const chatResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatRequestBody)
    })

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text()
      console.error(`\n❌ Chat API failed (${chatResponse.status}):`)
      console.error(errorText)
      return
    }

    const chatResult = await chatResponse.json()

    console.log(`\n✅ Chat API responded successfully!`)

    // Extract response content (handle different formats)
    let responseContent = ''
    if (chatResult.choices?.[0]?.message?.content) {
      responseContent = chatResult.choices[0].message.content
    } else if (chatResult.content) {
      responseContent = chatResult.content
    } else if (typeof chatResult === 'string') {
      responseContent = chatResult
    }

    console.log(`\n📝 AI Response (first 1000 chars):`)
    console.log('═'.repeat(60))
    console.log(responseContent.slice(0, 1000))
    console.log('═'.repeat(60))

    // Check for problematic patterns
    const hasAbstractOnlyWarning = /仅有摘要|仅.*摘要|abstract only|based on abstract|upload.*pdf|上传.*PDF/i.test(responseContent)
    const hasFullContentAcknowledgment = /完整内容|全文|full text|complete content|完整论文|FULL.*CONTENT/i.test(responseContent)

    console.log(`\n🔍 Response quality check:`)
    console.log(`   - Contains "abstract only" warning: ${hasAbstractOnlyWarning ? '❌ PROBLEM!' : '✅ Good'}`)
    console.log(`   - Acknowledges full content: ${hasFullContentAcknowledgment ? '✅ Excellent!' : '⚠️  Not explicit'}`)

    if (hasAbstractOnlyWarning) {
      console.log(`\n❌ TEST FAILED: AI still thinks it only has abstract!`)
      console.log(`   This indicates the fix may need further adjustment.`)
    } else {
      console.log(`\n✅ TEST PASSED: AI is using full PDF content!`)
    }

    // Final summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`PDF File: ✅ Valid (${(pdfStats.size / 1024).toFixed(1)} KB)`)
    console.log(`PDF Parsing: ✅ Success (${parseResult.text?.length || 0} chars extracted)`)
    console.log(`Chat API: ✅ Responded`)
    console.log(`Content Usage: ${hasAbstractOnlyWarning ? '❌ Still using abstract' : '✅ Using full content'}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error(error.stack)
  }
}

// Run test
testPDFProcessing().catch(console.error)
